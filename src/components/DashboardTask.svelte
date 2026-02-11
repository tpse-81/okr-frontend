<!--
@component
- Component for displaying tasks inside a table.
- Usage:
  ```html
  <Tasks tasks={tasks}>
  ```
-->
<script lang="ts">
    import type { Task, TaskState } from "$lib/types";
    import { Edit, Trash, XCircle } from "@lucide/svelte";
    import { deleteTask, updateTask } from "$lib/api";
    import EditTaskComponent from "./EditTaskComponent.svelte";
    import ConfirmationDialog from "./ConfirmationDialog.svelte";

    const taskStates: TaskState[] = [
        "open",
        "planned",
        "in_progress",
        "done",
        "cancelled"
    ];

    let visibleTasks = $derived.by(() =>
        tasks.filter(task =>
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedStatuses.length === 0 || selectedStatuses.includes(task.task_state))
        )
    );

    let { tasks }: { tasks: Task[] } = $props();

    let selectedStatuses = $state<TaskState[]>([]);
    let selectedTasks = $state<string[]>([]);
    let selectedTask: Task | null = null;
    let searchTerm = $state("");
    let showConfirmationDialog = $state(false);
    let showEditDialog = $state(false);

    function stateBadge(state: TaskState) {
        switch (state) {
            case "open":
                return "badge-ghost";
            case "planned":
                return "badge-warning";
            case "in_progress":
                return "badge-info";
            case "done":
                return "badge-success";
            case "cancelled":
                return "badge-error";
        }
    }

    function label(state: TaskState) {
        switch (state) {
            case "open": return "Todo";
            case "planned": return "Backlog";
            case "in_progress": return "In progress";
            case "done": return "Done";
            case "cancelled": return "Canceled";
        }
    }

    async function onDeleteTask() {
        showConfirmationDialog = false;

        if (!selectedTask) return;

        try {
            await deleteTask(selectedTask.id);
            tasks = tasks.filter(t => t.id !== selectedTask.id);
            selectedTask = null;
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    }

    function toggleStatus(status: TaskState) {
        if (selectedStatuses.includes(status)) {
            selectedStatuses = selectedStatuses.filter(s => s !== status);
        } else {
            selectedStatuses = [...selectedStatuses, status];
        }
        console.log(selectedStatuses);
    }

    async function markSelectedDone() {
        await Promise.all(
            tasks
                .filter(task => selectedTasks.includes(task.id))
                .map(async (task) => {
                    const updated = await updateTask({ ...task, task_state: "done" });
                    return updated;
                })
        );
        tasks = tasks.map(task =>
            selectedTasks.includes(task.id) ? { ...task, task_state: "done" } : task
        );

        selectedTasks = [];
    }

    async function changeSelectedStatus(newStatus: TaskState) {
        await Promise.all(
            tasks
                .filter(task => selectedTasks.includes(task.id))
                .map(async (task) => {
                    const updated = await updateTask({ ...task, task_state: newStatus });
                    return updated;
                })
        );
        tasks = tasks.map(task =>
            selectedTasks.includes(task.id) ? { ...task, task_state: newStatus } : task
        );
        selectedTasks = [];
    }


    async function deleteSelectedTasks() {
        for (const id of selectedTasks) {
            await deleteTask(id);
        }
        tasks = tasks.filter(task => !selectedTasks.includes(task.id));
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
                    <span class="text-sm badge badge-ghost flex items-center gap-1" style="white-space: nowrap;">
                    {label(s)}
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
                                    <input type="checkbox" class="checkbox checkbox-xs" checked={selectedStatuses.includes(status)} onchange={() => toggleStatus(status)}/>
                                    <span class="flex-1">
                                        {label(status)}
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

    <div class="overflow-x-auto rounded-box border border-base-content/5 bg-white-100" style="height: 400px;">
        <table class="table table-fixed w-full">
            <colgroup>
                <col style="width: 50px;" />
                <col style="width: 65%;" />
                <col style="width: 10%;" />
                <col style="width: 10%;" />
                <col style="width: 40px;" />
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
                <tr class="hover {selectedTasks.includes(task.id) ? 'bg-gray-900' : ''}" style="transition: background-color 0.2s;">
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
                    <span class="badge badge-soft {stateBadge(task.task_state)}">
                        {label(task.task_state)}
                    </span>
                    </td>
                    <td class="text-right">
                        <div class="dropdown dropdown-left">
                            <div tabindex="0" role="button" class="btn btn-ghost btn-lg">...</div>
                            <ul tabindex="-1" class="dropdown-content menu bg-gray-950 rounded-box z-1 w-30 p-2 shadow-sm">
                                <li>
                                    <a class="flex items-center gap-2" onclick={() => {selectedTask = task; showEditDialog = true;}}>
                                        <Edit size="16" />Edit
                                    </a>
                                </li>
                                <li>
                                    <a class="flex items-center gap-2" onclick={() => {selectedTask = task; showConfirmationDialog = true; }}>
                                        <Trash size="16" />Delete
                                    </a>
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
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-gray-950 rounded-box w-40">
                        {#each taskStates as status}
                            <li>
                                <a onclick={() => changeSelectedStatus(status)}>{label(status)}</a>
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

