<!--
@component
- Component for displaying tasks inside a table.
- Usage:
  ```html
  <Tasks tasks={tasks}>
  ```
-->
<script lang="ts">
import { Edit, Trash, XCircle } from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { deleteTask, getTaskPermission, updateTask } from "$lib/api";
import { type Task, type TaskState, taskStates } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditTaskComponent from "./EditTaskComponent.svelte";

const taskStateMap = taskStates.reduce(
	(acc, s) => {
		acc[s.state] = s;
		return acc;
	},
	{} as Record<TaskState, { state: TaskState; label: string; badge: string }>,
);

let visibleTasks = $derived.by(() =>
	tasks.filter(
		(task) =>
			task.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
			(selectedStatuses.length === 0 ||
				selectedStatuses.includes(task.task_state)),
	),
);

let { tasks }: { tasks: Task[] } = $props();

let selectedStatuses = $state<TaskState[]>([]);
let selectedTasks = $state<string[]>([]);
let selectedTask: Task | null = $state(null);
let searchTerm = $state("");
let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);
let taskPermissions = $state<Record<string, { can_write: boolean }>>({});

onMount(loadTaskPermissions);

$effect(() => {
	loadTaskPermissions();
});

async function loadTaskPermissions() {
	if (!tasks?.length) return;

	const entries = await Promise.all(
		tasks.map(async (task) => {
			try {
				const caps = await getTaskPermission(task.id);
				return [task.id, caps] as const;
			} catch {
				return [task.id, { can_write: false }] as const;
			}
		}),
	);

	taskPermissions = Object.fromEntries(entries);
}

function canWrite(taskId: string) {
	return taskPermissions[taskId]?.can_write ?? false;
}

async function onDeleteTask() {
	showConfirmationDialog = false;

	const task = selectedTask;
	if (!task) return;

	try {
		await deleteTask(task.id);
		tasks = tasks.filter((t) => t.id !== task.id);
		selectedTask = null;
	} catch (err) {
		console.error("Error deleting task:", err);
	}
}

function toggleStatus(status: TaskState) {
	if (selectedStatuses.includes(status)) {
		selectedStatuses = selectedStatuses.filter((s) => s !== status);
	} else {
		selectedStatuses = [...selectedStatuses, status];
	}
	console.log(selectedStatuses);
}

async function markSelectedDone() {
	await changeSelectedStatus("done");
}

async function changeSelectedStatus(newStatus: TaskState) {
	await Promise.all(
		tasks
			.filter((task) => selectedTasks.includes(task.id))
			.map(async (task) => {
				const updated = await updateTask({ ...task, task_state: newStatus });
				return updated;
			}),
	);
	tasks = tasks.map((task) =>
		selectedTasks.includes(task.id) ? { ...task, task_state: newStatus } : task,
	);
	selectedTasks = [];
}

async function deleteSelectedTasks() {
	for (const id of selectedTasks) {
		await deleteTask(id);
	}
	tasks = tasks.filter((task) => !selectedTasks.includes(task.id));
	selectedTasks = [];
}
</script>
<div class="card card-bordered bg-white-100 h-auto lg:h-125">

    <!-- Header -->
    <div class="p-3 lg:p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0">
        <div>
            <h2 class="text-base lg:text-lg font-semibold">{$_("dashboard.availableTasks")}</h2>
        </div>

        <div class="flex flex-col lg:flex-row gap-2 items-start lg:items-center w-full lg:w-auto">
            {#if selectedStatuses.length}
                <div class="flex gap-1 sm:gap-2 overflow-x-auto">
                    {#each selectedStatuses as s}
                <span class="text-xs sm:text-sm badge badge-ghost flex-shrink-0 flex items-center gap-1 whitespace-nowrap">
                    {$_(taskStateMap[s].label)}
                    <button class="ml-1 btn btn-ghost btn-xs p-0" onclick={() => toggleStatus(s)} aria-label="Remove status">
                        <XCircle class="h-3 w-3" />
                    </button>
                </span>
                    {/each}
                </div>
            {/if}

            <!-- Dropdown -->
            <div class="dropdown dropdown-bottom">
                <div tabindex="0" role="button" class="btn btn-xs sm:btn-sm btn-outline flex items-center gap-2">
                    {$_("dashboard.status")}
                </div>
                <div role="menu" tabindex="0" class="dropdown-content z-1 mt-2 w-44 sm:w-52 rounded-box bg-base-100 shadow p-2">
                    <ul class="menu menu-sm">
                        {#each taskStates as status}
                            <li>
                                <label class="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
                                    <input type="checkbox" class="checkbox checkbox-xs" checked={selectedStatuses.includes(status.state)} onchange={() => toggleStatus(status.state)}/>
                                    <span class="flex-1">{$_(status.label)}</span>
                                </label>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>

            <input type="text" bind:value={searchTerm} placeholder={$_("tasks.search")} class="input input-xs sm:input-sm input-bordered w-full lg:w-auto"/>
        </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-box border border-base-content/5 bg-white-100 h-[300px] sm:h-[400px]">
        <table class="table table-fixed w-full text-xs sm:text-sm">
            <colgroup>
                <col/>
                <col class="sm:w-2/3" />
                <col />
                <col />
                <col />
            </colgroup>
            <thead>
            <tr>
                <th></th>
                <th>{$_("tasks.title")}</th>
                <th></th>
                <th>{$_("dashboard.status")}</th>
                <th class="text-right"></th>
            </tr>
            </thead>
            <tbody>
            {#each visibleTasks as task}
                <tr class="hover transition duration-200 {selectedTasks.includes(task.id) ? 'bg-base-300' : ''}">
                    <td>
                        <input
                                type="checkbox"
                                class="checkbox checkbox-sm"
                                checked={selectedTasks.includes(task.id)}
                                disabled={!canWrite(task.id)}
                                onchange={() => {
                                if (!canWrite(task.id)) return;

                                if (selectedTasks.includes(task.id)) {
                                    selectedTasks = selectedTasks.filter(id => id !== task.id);
                                } else {
                                    selectedTasks = [...selectedTasks, task.id];
                                }
                            }}
                        />
                    </td>
                    <td class="truncate">
                        <div class="text-sm sm:text-md font-extrabold truncate">
                            <a href={`/key_results/${task.key_result_id}`}>
                                {task.description}
                            </a>
                        </div>
                    </td>
                    <td></td>
                    <td>
                            <span class="badge badge-soft text-xs sm:text-sm {taskStateMap[task.task_state].badge}">
                                {$_(taskStateMap[task.task_state].label)}
                            </span>
                    </td>
                    <td class="text-right">
                        <div class="dropdown dropdown-left">
                            <button
                                    type="button"
                                    class="btn btn-ghost btn-xs sm:btn-lg"
                                    disabled={!canWrite(task.id)}
                            >
                                ...
                            </button>
                            <ul tabindex="-1" class="dropdown-content menu bg-base-300 rounded-box z-1 w-28 sm:w-30 p-2 shadow-sm text-xs sm:text-sm">
                                <li>
                                    <button
                                            type="button"
                                            class="flex items-center gap-1 sm:gap-2"
                                            onclick={() => { selectedTask = task; showEditDialog = true; }}
                                    >
                                        <Edit size="14" />{$_("common.edit")}
                                    </button>
                                </li>
                                <li>
                                    <button
                                            type="button"
                                            class="flex items-center gap-1 sm:gap-2"
                                            onclick={() => { selectedTask = task; showConfirmationDialog = true; }}
                                    >
                                        <Trash size="14" />{$_("common.delete")}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>

    <!-- Footer -->
    <div class="p-2 lg:p-3 border-t text-xs sm:text-sm flex flex-col lg:flex-row justify-between gap-2">
        <span>{tasks.length} {$_("tasks.titleSingPlu")}</span>
        <div class="flex flex-col lg:flex-row gap-2">
            {#if selectedTasks.length > 0}
                <span class="font-medium">{selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected</span>
                <button class="btn btn-xs sm:btn-sm btn-outline btn-success" onclick={markSelectedDone}>
                    {$_("dashboard.markDone")}
                </button>
                <div class="dropdown dropdown-top dropdown-center">
                    <button tabindex="0" class="btn btn-xs w-full sm:btn-sm btn-outline">
                        {$_("dashboard.changeStatus")}
                    </button>
                    <ul class="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-36 sm:w-40">
                        {#each taskStates as status}
                            <li>
                                <button
                                        type="button"
                                        class="w-full text-left px-2 py-1 text-xs sm:text-sm"
                                        onclick={() => changeSelectedStatus(status.state)}
                                >
                                    {$_(status.label)}
                                </button>
                            </li>
                        {/each}
                    </ul>
                </div>
                <button class="btn btn-xs sm:btn-sm btn-outline btn-error" onclick={deleteSelectedTasks}>
                    {$_("common.delete")}
                </button>
            {/if}
        </div>
    </div>
</div>


{#if showEditDialog && selectedTask}
    <EditTaskComponent
            show={showEditDialog}
            task={selectedTask}
            ondismiss={() => showEditDialog = false}
    />
{/if}

{#if showConfirmationDialog && selectedTask}
    <ConfirmationDialog
            show={showConfirmationDialog}
            message="Delete task"
            onconfirm={onDeleteTask}
            ondismiss={() => showConfirmationDialog = false} />
{/if}

