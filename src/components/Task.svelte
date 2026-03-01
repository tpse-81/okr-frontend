<!--
@component
- Component for displaying tasks.
- Usage:
  ```html
  <Task task={task}>
  ```
-->
<script lang="ts">
import { Archive, Edit, Info, Trash } from "@lucide/svelte";
import { deleteTask, updateTask } from "$lib/api";
import { _ } from "svelte-i18n";
import { type Task, type TaskState, taskStates } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditTaskComponent from "./EditTaskComponent.svelte";

let {
	task,
	onTaskDeleted,
}: { task: Task; onTaskDeleted: (id: string) => void } = $props();
let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);
let taskStateDropdown: HTMLElement;

let title = $derived(task.name?.trim() ? task.name : task.description);
let details = $derived(task.name?.trim() ? task.description : "");

// biome-ignore lint/style/noNonNullAssertion: taskStates is guaranteed to contain all possible states
const taskState = $derived(
	taskStates.find((t) => t.state === task.task_state),
)!;

const isArchived = $derived(task.is_archived === true);

async function onDeleteTask() {
	showConfirmationDialog = false;

	if (await deleteTask(task.id)) onTaskDeleted(task.id);
}

async function setTaskState(newState: TaskState) {
	task.task_state = newState;
	await updateTask(task);

	// hide dropdown again, see https://github.com/saadeghi/daisyui/discussions/1870
	taskStateDropdown.blur();
}
</script>

<li class="card card-border relative">
  <div class="dropdown">
    <div
      class="absolute left-2 top-2 badge {taskState.badge} cursor-pointer"
      role="button"
      tabindex="0"
    >
      <Info size="16" />
      <span>{$_(taskState.label)}</span>
    </div>
    <ul
      bind:this={taskStateDropdown}
      tabindex="-1"
      class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
    >
      {#each taskStates as state}
        <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li class="btn btn-ghost" role="button" onclick={() => setTaskState(state.state)}>
          {$_(state.label)}
        </li>
      {/each}
    </ul>
  </div>

  <div class="absolute right-2 top-2 flex gap-2">
    <button class="btn btn-square" disabled={isArchived} onclick={() => (showEditDialog = true)}>
      <Edit size="16" />
    </button>
    <button class="btn btn-square" disabled={isArchived} onclick={() => (showConfirmationDialog = true)}>
      <Trash size="16" />
    </button>
  </div>

  <div class="card-body pt-12">
    {#if isArchived}
      <div class="badge badge-warning mb-2">
        <Archive size="16" /> Archived
      </div>
    {/if}

    {task.description}<br />
    <span class="opacity-70">(State: {task.task_state})</span>
  </div>
</li>

<EditTaskComponent show={showEditDialog} task={task} ondismiss={() => showEditDialog = false} />
<ConfirmationDialog show={showConfirmationDialog} message={$_("tasks.delete")} onconfirm={onDeleteTask} ondismiss={() => showConfirmationDialog = false} />
