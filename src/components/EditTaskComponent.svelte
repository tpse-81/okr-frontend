<script lang="ts">
import { _ } from "svelte-i18n";
import { updateTask } from "$lib/api";
import { type Task, type TaskState, taskStates } from "$lib/types";

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
		console.log("here");
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

<dialog
	id="edit-task-modal"
	bind:this={modal}
	class="modal"
	oncancel={ondismiss}
>
	<div class="modal-box">
		<h3 class="text-lg font-bold">{$_("tasks.edit")}</h3>

		<form class="flex flex-col gap-3 mt-3" onsubmit={onUpdateTask}>
			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">{$_("tasks.name")}</span>
				</div>
				<input
					type="text"
					bind:value={name}
					placeholder={$_("tasks.name")}
					class="input input-bordered w-full"
					required
				>
			</label>

			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">{$_("common.description")}</span>
				</div>
				<textarea
					bind:value={description}
					placeholder={$_("common.description")}
					class="textarea textarea-bordered w-full"
					rows="3"
				></textarea>
			</label>

			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">{$_("tasks.state")}</span>
				</div>

				<!-- gleiche Layout-Logik wie vorher, nur mit Label -->
				<div class="flex w-full items-center justify-between gap-3">
					<select
						bind:value={taskState}
						class="select select-bordered w-44 sm:w-56"
					>
						{#each taskStates as state}
							<option value={state.state}>{$_(state.label)}</option>
						{/each}
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
			</label>
		</form>
	</div>
</dialog>
