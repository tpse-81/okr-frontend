<!--
@component
- Component for displaying key results.
- Usage:
  ```html
  <KeyResult keyResult={keyResult}>
  ```
-->
<script lang="ts">
import { Edit, Trash, PlusCircle, MinusCircle } from "@lucide/svelte";
import { fade } from "svelte/transition";
import {deleteKeyResult, updateKeyResultCurrentValue} from "$lib/api";
import type { KeyResult } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditKeyResultComponent from "./EditKeyResultComponent.svelte";
import {isBetween} from "$lib/utils";
let errorMessage: string = $state("");
let errorTimeout: ReturnType<typeof setTimeout> | null = null;

let {
	keyResult,
	onKeyResultDeleted,
}: { keyResult: KeyResult; onKeyResultDeleted: () => void } = $props();

function showError(message: string) {
    errorMessage = message;

    if (errorTimeout) {
        clearTimeout(errorTimeout);
    }

    errorTimeout = setTimeout(() => {
        errorMessage = "";
        errorTimeout = null;
    }, 1500);
}

let progress = $derived.by(() => {
    const current = keyResult.current_value;
    const start = keyResult.start_value;
    const end = keyResult.end_value;

    const diff = Math.abs(end - start);
    if (diff === 0) return 100;

    const position = Math.abs(current - start) / diff;

    return Number((position * 100).toFixed(2));
});

async function updateCurrentValue() {
    const current = keyResult.current_value;
    const start = keyResult.start_value;
    const end = keyResult.end_value;
    let nextValue = 0;

    if(start < end){
        nextValue = current + 1;
    }
    if(start > end){
        nextValue = current - 1;
    }

    if (!isBetween(nextValue, keyResult.start_value, end)) {
        showError("Current value is out of bounds");
        return;
    }

    try {
        const updated = await updateKeyResultCurrentValue(keyResult.id, nextValue);
        keyResult.current_value = updated.current_value;
    } catch (err) {
        console.error(err);
        showError("Current value could not be updated");
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
            <button class="btn btn-square" onclick={updateCurrentValue}>
                {#if keyResult.start_value > keyResult.end_value}
                    <MinusCircle size="16" />
                {:else}
                    <PlusCircle size="16" />
                {/if}
            </button>
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
        {#if errorMessage}
            <div
                    in:fade={{ duration: 120 }}
                    out:fade={{ duration: 240 }}
                    class="alert alert-error absolute bottom-2 left-2 right-2 z-10 p-2 text-sm"
            >
                {errorMessage}
            </div>
        {/if}
    </a>
</li>

<EditKeyResultComponent show={showEditDialog} keyResult={keyResult} ondismiss={() => showEditDialog = false} />
<ConfirmationDialog show={showConfirmationDialog} message="Delete key result" onconfirm={onDeleteKeyResult} ondismiss={() => showConfirmationDialog = false} />
