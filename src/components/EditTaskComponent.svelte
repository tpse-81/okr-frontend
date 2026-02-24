<script lang="ts">
import { _ } from "svelte-i18n";
import { updateTask } from "$lib/api";
import type { Task, TaskState } from "$lib/types";

let {
	show,
	task,
	ondismiss,
}: { show: boolean; task: Task; ondismiss: () => void } = $props();

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
    <h3 class="text-lg font-bold">{$_("tasks.edit")}</h3>
<<<<<<< HEAD

    <form class="flex flex-col gap-3 mt-3" onsubmit={onUpdateTask}>
      <input
        type="text"
        bind:value={name}
        placeholder="Title"
        class="input input-bordered w-full"
        required
      />

      <textarea
        bind:value={description}
        placeholder={$_("common.description")}
        class="textarea textarea-bordered w-full"
        rows="3"
      />

      <div class="modal-action">
        <div class="flex w-full items-center justify-between gap-3">
          <select bind:value={taskState} class="select select-bordered w-44 sm:w-56">
            <option value="open">{$_("tasks.open")}</option>
            <option value="planned">{$_("tasks.planned")}</option>
            <option value="in_progress">{$_("tasks.inProgress")}</option>
            <option value="done">{$_("tasks.done")}</option>
            <option value="cancelled">{$_("tasks.cancelled")}</option>
          </select>

          <div class="flex gap-3">
            <button type="button" class="btn" onclick={ondismiss}>
              {$_("common.close")}
            </button>
            <button type="submit" class="btn btn-primary">
              {$_("common.confirm")}
            </button>
          </div>
        </div>
      </div>
=======
    <form class="flex flex-col gap-3 mt-3">
	    <input type="text" bind:value={description} placeholder="Description" class="input w-full">
	    <select bind:value={taskState} class="select select-bordered">
	        <option value="open">{$_("tasks.open")}</option>
	        <option value="planned">{$_("tasks.planned")}</option>
	        <option value="in_progress">{$_("tasks.in_progress")}</option>
	        <option value="done">{$_("tasks.done")}</option>
	        <option value="cancelled">{$_("tasks.cancelled")}</option>
	    </select>
>>>>>>> origin/main
    </form>
  </div>
</dialog>

