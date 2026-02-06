<script lang="ts">
import { updateKeyResult } from "$lib/api";
import type { KeyResult } from "$lib/types";
import { isBetween } from "$lib/utils";
import ErrorMessage from "./ErrorMessage.svelte";

let {
	show,
	keyResult,
	ondismiss,
}: {
	show: boolean;
	keyResult: KeyResult;
	ondismiss: () => void;
} = $props();

let errorMessage: string | null = $state(null);

// svelte-ignore non_reactive_update
let modal: HTMLDialogElement;
// svelte-ignore state_referenced_locally
let description: string = $state(keyResult.description);
// svelte-ignore state_referenced_locally
let startValue: number = $state(keyResult.start_value);
// svelte-ignore state_referenced_locally
let endValue: number = $state(keyResult.end_value);
// svelte-ignore state_referenced_locally
let currentValue: number = $state(keyResult.current_value);

$effect(() => {
	if (show) modal.showModal();
	else modal.close();
});

async function onUpdatekeyResult() {
	if (!isBetween(currentValue, startValue, endValue)) {
		errorMessage = null;
		errorMessage = "Current value is out of bounds";
		return;
	}
	keyResult.description = description;
	keyResult.start_value = startValue;
	keyResult.end_value = endValue;
	keyResult.current_value = currentValue;

	await updateKeyResult(keyResult);

	ondismiss();
}
</script>

<dialog id="edit-key-result-modal" bind:this={modal} class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Edit key result</h3>
    <ErrorMessage message={errorMessage} />
    <form class="flex flex-col gap-3 mt-3">
	    <input type="text" bind:value={description} placeholder="description" class="input w-full">
	    <input type="number" bind:value={startValue} placeholder="start value" class="input w-full">
        <input type="number" bind:value={currentValue} placeholder="current value" class="input w-full">
	    <input type="number" bind:value={endValue} placeholder="end value" class="input w-full">
    </form>
      <div class="modal-action">
          <div class="flex gap-3 w-full justify-end">
              <button type="button" class="btn" onclick={ondismiss}>Close</button>
              <button type="button" class="btn btn-primary" onclick={onUpdatekeyResult}>Confirm</button>
          </div>
      </div>
  </div>
</dialog>


