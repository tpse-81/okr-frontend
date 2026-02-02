<!--
@component
- Component for displaying tasks.
- Usage:
  ```html
  <Task task={task}>
  ```
-->
<script lang="ts">
import { Edit, Trash } from "@lucide/svelte";
import { deleteTask } from "$lib/api";
import type { Task } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditTaskComponent from "./EditTaskComponent.svelte";

let { task, onTaskDeleted }: { task: Task; onTaskDeleted: () => void } =
	$props();
let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);

async function onDeleteTask() {
	showConfirmationDialog = false;

	if (await deleteTask(task.id)) onTaskDeleted();
}
</script>

<li class="card card-border relative">
	<div class="absolute right-2 top-2 flex gap-2">
	  <button class="btn btn-square" onclick={() => showEditDialog = true}><Edit size="16" /></button>
	  <button class="btn btn-square" onclick={() => showConfirmationDialog = true}><Trash size="16" /></button>
	</div>
  <div class="card-body">
      {task.description}<br>
      (State: {task.task_state})<br>
  </div>
</li>

<EditTaskComponent show={showEditDialog} task={task} ondismiss={() => showEditDialog = false} />
<ConfirmationDialog show={showConfirmationDialog} message="Delete task" onconfirm={onDeleteTask} ondismiss={() => showConfirmationDialog = false} />
