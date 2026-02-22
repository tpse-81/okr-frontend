<script lang="ts">
import { updateTask } from "$lib/api";
import type { Task, TaskState } from "$lib/types";

let { show, task, ondismiss }: { show: boolean; task: Task; ondismiss: () => void } = $props();

let modal: HTMLDialogElement;

let name = $state("");
let description = $state("");
let taskState: TaskState = $state("open");

$effect(() => {
  if (!modal) return;

  if (show && !modal.open) {
    // sync local form state from props on open
    name = task.name ?? "";
    description = task.description ?? "";
    taskState = task.task_state;

    modal.showModal();
  } else if (!show && modal.open) {
    modal.close();
  }
});

async function onUpdateTask() {
  const title = name.trim();
  if (!title) return;

  task.name = title;
  task.description = description;
  task.task_state = taskState;

  await updateTask(task);
  ondismiss();
}
</script>

<dialog id="edit-task-modal" bind:this={modal} class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Edit task</h3>
	<form class="flex flex-col gap-3 mt-3">
	<input type="text" bind:value={name} placeholder="Title" class="input input-bordered w-full" required />
	<textarea bind:value={description} placeholder="Description" class="textarea textarea-bordered w-full" rows="3"></textarea>
	    <select bind:value={taskState} class="select select-bordered">
	        <option value="open">open</option>
	        <option value="planned">planned</option>
	        <option value="in_progress">in_progress</option>
	        <option value="done">done</option>
	        <option value="cancelled">cancelled</option>
	    </select>
    </form>
	<div class="modal-action">
		<button type="button" class="btn" onclick={ondismiss}>Close</button>
		<button type="button" class="btn btn-primary" onclick={onUpdateTask}>Confirm</button>
	</div>
  </div>
</dialog>

