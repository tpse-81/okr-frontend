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
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { deleteTask, getTaskPermission, updateTask } from "$lib/api";
import { type Task, type TaskState, taskStates } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditTaskComponent from "./EditTaskComponent.svelte";
import ExpandableDescription from "./ExpandableDescription.svelte";

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

let canEdit = $state(false);

onMount(async () => {
	try {
		const permissions = await getTaskPermission(task.id);
		canEdit = permissions.can_write;
	} catch (err) {
		console.error("Failed to load project permissions", err);
	}
});

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

<li class="card card-border relative min-w-0">
	<span class="dropdown" title={!canEdit ? $_("common.noPermissions") : ""}>
		<!-- trigger -->
		<div
			class="absolute left-2 top-2 badge {taskState.badge}
			       {canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}"
			role="button"
			tabindex={canEdit ? 0 : -1}
			onclick={() => canEdit && taskStateDropdown?.classList.toggle("dropdown-open")}
		>
			<Info size="16" />
			<span>{$_(taskState.label)}</span>
		</div>

		<!-- dropdown -->
		{#if canEdit}
			<ul
				bind:this={taskStateDropdown}
				tabindex="-1"
				class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
			>
				{#each taskStates as state}
					<li
						class="btn btn-ghost"
						role="button"
						onclick={() => setTaskState(state.state)}
					>
						{$_(state.label)}
					</li>
				{/each}
			</ul>
		{/if}
	</span>

	<div
		class="absolute right-2 top-2 flex gap-2"
		title={!canEdit ? $_("common.noPermissions") : ""}
	>
		<button
			class="btn btn-square"
			disabled={isArchived || !canEdit}
			onclick={() => (showEditDialog = true)}
		>
			<Edit size="16" />
		</button>
		<button
			class="btn btn-square"
			disabled={isArchived || !canEdit}
			onclick={() => (showConfirmationDialog = true)}
		>
			<Trash size="16" />
		</button>
	</div>

	<div class="card-body pt-12">
		{#if isArchived}
			<div class="badge badge-warning mb-2">
				<Archive size="16" /> {$_("common.archived")}
			</div>
		{/if}

		<h2 class="card-title">
			<span class="line-clamp-1 break-words"> {title} </span>
		</h2>

		{#if details}
			<ExpandableDescription text={details} />
		{/if}
	</div>
</li>

<EditTaskComponent
	show={showEditDialog}
	{task}
	ondismiss={() => showEditDialog = false}
/>
<ConfirmationDialog
	show={showConfirmationDialog}
	message={$_("tasks.delete")}
	onconfirm={onDeleteTask}
	ondismiss={() => showConfirmationDialog = false}
/>
