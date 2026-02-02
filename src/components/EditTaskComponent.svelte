<script lang="ts">
import { updateTask } from "$lib/api";
import type { Task, TaskState } from "$lib/types";

let {
	show,
	task,
	ondismiss,
}: {
	show: boolean;
	task: Task;
	ondismiss: () => void;
} = $props();

// svelte-ignore non_reactive_update
let modal: HTMLDialogElement;
// svelte-ignore state_referenced_locally
let description: string = $state(task.description);
// svelte-ignore state_referenced_locally
let taskState: TaskState = $state(task.task_state);

$effect(() => {
	if (show) modal.showModal();
	else modal.close();
});

async function onUpdateTask() {
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
	    <input type="text" bind:value={description} placeholder="Description" class="input w-full">
	    <select bind:value={taskState} class="select select-bordered">
	        <option value="open">open</option>
	        <option value="planned">planned</option>
	        <option value="in_progress">in_progress</option>
	        <option value="done">done</option>
	        <option value="cancelled">cancelled</option>
	    </select>
    </form>
    <div class="modal-action">
      <form method="dialog" class="flex gap-3 w-full justify-end">
        <button class="btn" onclick={ondismiss}>Close</button>
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn btn-primary" onclick={onUpdateTask}>Confirm</button>
      </form>
    </div>
  </div>
</dialog>

