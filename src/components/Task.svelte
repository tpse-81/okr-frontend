<!--
@component
- Component for displaying tasks.
- Usage:
  ```html
  <Task task={task}>
  ```
-->
<script lang="ts">
import { Edit, Info, Trash } from "@lucide/svelte";
import { _ } from "svelte-i18n";
import { deleteTask } from "$lib/api";
import type { Task } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditTaskComponent from "./EditTaskComponent.svelte";

let {
	task,
	onTaskDeleted,
}: { task: Task; onTaskDeleted: (id: string) => void } = $props();
let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);

let title = $derived(task.name?.trim() ? task.name : task.description);
let details = $derived(task.name?.trim() ? task.description : "");

async function onDeleteTask() {
	showConfirmationDialog = false;

	if (await deleteTask(task.id)) onTaskDeleted(task.id);
}
</script>

<li class="card card-border relative">
  <div class="absolute left-2 top-2 badge badge-info">
    <Info size="16" />
    <span>{$_(`tasks.${task.task_state}`)}</span>
  </div>

  <div class="absolute right-2 top-2 flex gap-2">
    <button type="button" class="btn btn-square" onclick={() => (showEditDialog = true)}>
      <Edit size="16" />
    </button>
    <button type="button" class="btn btn-square" onclick={() => (showConfirmationDialog = true)}>
      <Trash size="16" />
    </button>
  </div>

  <div class="card-body pt-12">
    <h3 class="card-title">{title}</h3>

    {#if details?.trim()}
      <p>{details}</p>
    {/if}
  </div>
</li>

<EditTaskComponent show={showEditDialog} task={task} ondismiss={() => showEditDialog = false} />
<ConfirmationDialog show={showConfirmationDialog} message={$_("tasks.delete")} onconfirm={onDeleteTask} ondismiss={() => showConfirmationDialog = false} />
