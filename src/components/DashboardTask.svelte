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
import { deleteTask, updateTask } from "$lib/api";
import type { Task, TaskState } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditTaskComponent from "./EditTaskComponent.svelte";

const taskStates: { state: TaskState; label: string; badge: string }[] = [
	{ state: "open", label: "Todo", badge: "badge-ghost" },
	{ state: "planned", label: "Backlog", badge: "badge-warning" },
	{ state: "in_progress", label: "In progress", badge: "badge-info" },
	{ state: "done", label: "Done", badge: "badge-success" },
	{ state: "cancelled", label: "Canceled", badge: "badge-error" },
];

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
<div class="card card-bordered bg-white-100 h-125">
    <div class="p-4 flex items-center justify-between">
        <div>
            <h2 class="text-lg font-semibold">Your tasks</h2>
            <p class="text-sm opacity-60">Here’s a list of your tasks.</p>
        </div>
        <div class="flex gap-2 items-center">
            {#if selectedStatuses.length}
                {#each selectedStatuses as s}
                    <span class="text-sm badge badge-ghost flex items-center gap-1 whitespace-nowrap">
                    {taskStateMap[s].label}
                        <button class="ml-1 btn btn-ghost btn-xs p-0" onclick={() => toggleStatus(s)} aria-label="Remove status">
                            <XCircle class="h-3 w-3" />
                        </button>
                    </span>
                {/each}
            {/if}
            <div class="dropdown dropdown-bottom">
                <div tabindex="0" role="button" class="btn btn-sm btn-outline flex items-center gap-2">
                    Status
                </div>
                <div role="menu" tabindex="0" class="dropdown-content z-1 mt-2 w-52 rounded-box bg-base-100 shadow p-2">
                    <ul class="menu menu-sm">
                        {#each taskStates as status}
                            <li>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" class="checkbox checkbox-xs" checked={selectedStatuses.includes(status.state)} onchange={() => toggleStatus(status.state)}/>
                                    <span class="flex-1">
                                        {status.label}
                                    </span>
                                </label>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
            <input type="text" bind:value={searchTerm} placeholder="Search for tasks…" class="input input-sm input-bordered"/>
        </div>
    </div>

    <div class="overflow-x-auto rounded-box border border-base-content/5 bg-white-100 h-[400px]">
        <table class="table table-fixed w-full">
            <colgroup>
                <col/>
                <col class="w-2/3" />
                <col />
                <col />
                <col />
            </colgroup>
            <thead>
            <tr>
                <th></th>
                <th>Task</th>
                <th></th>
                <th>Status</th>
                <th class="text-right"></th>
            </tr>
            </thead>
            <tbody>
            {#each visibleTasks as task}
                <tr class="hover transition duration-200 {selectedTasks.includes(task.id) ? 'bg-gray-900' : ''}">
                    <td>
                        <input type="checkbox" class="checkbox checkbox-sm" checked={selectedTasks.includes(task.id)} onchange={() => {
                            if (selectedTasks.includes(task.id)) {
                                selectedTasks = selectedTasks.filter(id => id !== task.id);
                            } else {
                                selectedTasks = [...selectedTasks, task.id];
                            }}}
                        />
                    </td>
                    <td class="truncate">
                            <div class="text-md font-extrabold truncate">
                                <a href={`/key_results/${task.key_result_id}`}>
                                {task.description}
                                </a>
                            </div>
                    </td>
                    <td></td>
                    <td>
                        <span class="badge badge-soft {taskStateMap[task.task_state].badge}">
                            {taskStateMap[task.task_state].label}
                        </span>
                    </td>
                    <td class="text-right">
                        <div class="dropdown dropdown-left">
                            <div tabindex="0" role="button" class="btn btn-ghost btn-lg">...</div>
                            <ul tabindex="-1" class="dropdown-content menu bg-gray-950 rounded-box z-1 w-30 p-2 shadow-sm">
                                <li>
                                    <button
                                            type="button"
                                            class="flex items-center gap-2"
                                            onclick={() => { selectedTask = task; showEditDialog = true; }}>
                                        <Edit size="16" />Edit
                                    </button>
                                </li>
                                <li>
                                    <button
                                            type="button"
                                            class="flex items-center gap-2"
                                            onclick={() => { selectedTask = task; showConfirmationDialog = true; }}>
                                        <Trash size="16" />Delete
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


    <div class="p-3 border-t text-sm  flex justify-between">
        <span>{tasks.length} task(s)</span>
        <div>
            {#if selectedTasks.length > 0}
                <span class="font-medium">{selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected</span>
                <button class="btn btn-sm btn-outline btn-success" onclick={markSelectedDone}>
                    Mark Done
                </button>
                <div class="dropdown dropdown-top dropdown-center">
                    <button tabindex="0" class="btn btn-sm btn-outline">
                        Change Status
                    </button>
                    <ul class="dropdown-content menu p-2 shadow bg-gray-950 rounded-box w-40">
                        {#each taskStates as status}
                            <li>
                                <button
                                        type="button"
                                        class="w-full text-left px-2 py-1"
                                        onclick={() => changeSelectedStatus(status.state)}
                                >
                                    {status.label}
                                </button>
                            </li>
                        {/each}
                    </ul>
                </div>
                <button class="btn btn-sm btn-outline btn-error" onclick={deleteSelectedTasks}>
                    Delete
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

