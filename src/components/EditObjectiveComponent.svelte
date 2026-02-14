<script lang="ts">
import { updateObjective } from "$lib/api";
import type { Objective } from "$lib/types";

let {
	show,
	objective,
	ondismiss,
}: {
	show: boolean;
	objective: Objective;
	ondismiss: () => void;
} = $props();

// svelte-ignore non_reactive_update
let modal: HTMLDialogElement;
// svelte-ignore state_referenced_locally
let name: string = $state(objective.name);
// svelte-ignore state_referenced_locally
let description: string = $state(objective.description);

$effect(() => {
	if (show) modal.showModal();
	else modal.close();
});

async function onUpdateObjective() {
	if (objective.is_archived) {
		ondismiss();
		return;
	}

	objective.name = name;
	objective.description = description;

	await updateObjective(objective);

	ondismiss();
}
</script>

<dialog id="edit-objective-modal" bind:this={modal} class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Edit Objective</h3>
    <form class="flex flex-col gap-3 mt-3">
	    <input type="text" bind:value={name} placeholder="Name" class="input w-full">
	    <input type="text" bind:value={description} placeholder="Deadline" class="input w-full">
    </form>
    <div class="modal-action">
      <form method="dialog" class="flex gap-3 w-full justify-end">
        <button class="btn" onclick={ondismiss}>Close</button>
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn btn-primary" disabled={objective.is_archived} onclick={onUpdateObjective}>Confirm</button>
      </form>
    </div>
  </div>
</dialog>
