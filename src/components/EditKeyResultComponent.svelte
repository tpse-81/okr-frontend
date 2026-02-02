<script lang="ts">
import { updateKeyResult } from "$lib/api";
import type { KeyResult } from "$lib/types";

let {
	show,
	keyResult,
	ondismiss,
}: {
	show: boolean;
	keyResult: KeyResult;
	ondismiss: () => void;
} = $props();

// svelte-ignore non_reactive_update
let modal: HTMLDialogElement;
// svelte-ignore state_referenced_locally
let description: string = $state(keyResult.description);
// svelte-ignore state_referenced_locally
let startValue: number = $state(keyResult.start_value);
// svelte-ignore state_referenced_locally
let endValue: number = $state(keyResult.end_value);

$effect(() => {
	if (show) modal.showModal();
	else modal.close();
});

async function onUpdatekeyResult() {
	keyResult.description = description;
	keyResult.start_value = startValue;
	keyResult.end_value = endValue;

	await updateKeyResult(keyResult);

	ondismiss();
}
</script>

<dialog id="edit-key-result-modal" bind:this={modal} class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Edit key result</h3>
    <form class="flex flex-col gap-3 mt-3">
	    <input type="text" bind:value={description} placeholder="description" class="input w-full">
	    <input type="number" bind:value={startValue} placeholder="start value" class="input w-full">
	    <input type="number" bind:value={endValue} placeholder="end value" class="input w-full">
    </form>
    <div class="modal-action">
      <form method="dialog" class="flex gap-3 w-full justify-end">
        <button class="btn" onclick={ondismiss}>Close</button>
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn btn-primary" onclick={onUpdatekeyResult}>Confirm</button>
      </form>
    </div>
  </div>
</dialog>


