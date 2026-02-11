<!--
@component
- Component for displaying key results.
- Usage:
  ```html
  <KeyResult keyResult={keyResult}>
  ```
-->
<script lang="ts">
import { Edit, MinusCircle, PlusCircle, Trash } from "@lucide/svelte";
import { deleteKeyResult, updateKeyResultCurrentValue } from "$lib/api";
import type { KeyResult } from "$lib/types";
import { isBetween } from "$lib/utils";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditKeyResultComponent from "./EditKeyResultComponent.svelte";
import ErrorMessage from "./ErrorMessage.svelte";

let errorMessage: string | null = $state(null);

let {
	keyResult,
	onKeyResultDeleted,
}: { keyResult: KeyResult; onKeyResultDeleted: () => void } = $props();

let progress = $derived.by(() => {
	const current = keyResult.current_value;
	const start = keyResult.start_value;
	const end = keyResult.end_value;

	const diff = Math.abs(end - start);
	if (diff === 0) return 100;

	const position = Math.abs(current - start) / diff;

	return Number((position * 100).toFixed(2));
});

async function incrementCurrentValue() {
	await updateCurrentValue(keyResult.current_value + 1);
}

async function decrementCurrentValue() {
	await updateCurrentValue(keyResult.current_value - 1);
}

async function updateCurrentValue(nextValue: number) {
	if (!isBetween(nextValue, keyResult.start_value, keyResult.end_value)) {
		errorMessage = null;
		errorMessage = "Current value is out of bounds";
		return;
	}

	try {
		const updated = await updateKeyResultCurrentValue(keyResult.id, nextValue);
		keyResult.current_value = updated.current_value;
	} catch (err) {
		console.error(err);
		errorMessage = null;
		errorMessage = "Current value could not be updated";
	}
}

let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);

async function onDeleteKeyResult() {
	showConfirmationDialog = false;

	if (await deleteKeyResult(keyResult.id)) onKeyResultDeleted();
}
</script>

<li class="card card-border relative">
		<div class="absolute right-2 top-2 flex gap-2">
		  <button class="btn btn-square" onclick={() => showEditDialog = true}><Edit size="16" /></button>
		  <button class="btn btn-square" onclick={() => showConfirmationDialog = true}><Trash size="16" /></button>
        </div>
    <a href={`/key_results/${keyResult.id}`} class="card-body">
        <h2 class="card-title">{keyResult.description}</h2>
        <div class="flex gap-4">
            <div class="radial-progress" style={`--value:${progress};`} aria-valuenow={progress} role="progressbar">{progress}%</div>
            <div>
                <p>Start: {keyResult.start_value}</p>
                <p>Current: {keyResult.current_value}</p>
                <p>Goal: {keyResult.end_value}</p>
            </div>
        </div>
    </a>
    <div class="-mt-2 ml-5 mb-3">
        <button class="btn btn-square" onclick={incrementCurrentValue}>
            <PlusCircle size="16" />
        </button>
        <button class="btn btn-square" onclick={decrementCurrentValue}>
            <MinusCircle size="16" />
        </button>
    </div>
    <ErrorMessage message={errorMessage} />
</li>

<EditKeyResultComponent show={showEditDialog} keyResult={keyResult} ondismiss={() => showEditDialog = false} />
<ConfirmationDialog show={showConfirmationDialog} message="Delete key result" onconfirm={onDeleteKeyResult} ondismiss={() => showConfirmationDialog = false} />
