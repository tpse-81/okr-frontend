<!--
@component
- Component for displaying tasks.
- Usage:
  ```html
  <Task task={task}>
  ```
-->
<script lang="ts">
import { Trash } from "@lucide/svelte";
import { deleteTask } from "$lib/api";
import type { Task } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";

let { task, onTaskDeleted }: { task: Task; onTaskDeleted: () => void } =
	$props();
let showConfirmationDialog = $state(false);

async function onDeleteTask() {
	showConfirmationDialog = false;

	if (await deleteTask(task.id)) onTaskDeleted();
}
</script>

<li class="card card-border relative">
  <button class="btn btn-square absolute right-2 top-2" onclick={() => showConfirmationDialog = true}><Trash size="16" /></button>
  <div class="card-body">
      {task.description}<br>
      (State: {task.task_state})<br>
  </div>
</li>

<ConfirmationDialog show={showConfirmationDialog} message="Delete task" onconfirm={onDeleteTask} ondismiss={() => showConfirmationDialog = false} />
