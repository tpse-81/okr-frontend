<!--
@component
- Component for displaying key results.
- Usage:
  ```html
  <KeyResult keyResult={keyResult}>
  ```
-->
<script lang="ts">
import { Trash } from "@lucide/svelte";
import { deleteKeyResult } from "$lib/api";
import type { KeyResult } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";

let {
	keyResult,
	onKeyResultDeleted,
}: { keyResult: KeyResult; onKeyResultDeleted: () => void } = $props();

let progress = $derived((keyResult.start_value / keyResult.end_value) * 100);

let showConfirmationDialog = $state(false);

async function onDeleteKeyResult() {
	showConfirmationDialog = false;

	if (await deleteKeyResult(keyResult.id)) onKeyResultDeleted();
}
</script>

<li class="card card-border relative">
    <button class="btn btn-square absolute right-2 top-2" onclick={() => showConfirmationDialog = true}><Trash size="16" /></button>
    <a href={`/key_results/${keyResult.id}`} class="card-body">
        <h2 class="card-title">{keyResult.description}</h2>
        <div class="flex gap-4">
            <div class="radial-progress" style={`--value:${progress};`} aria-valuenow={progress} role="progressbar">{progress}%</div>
            <div>
                <p>Current: {keyResult.start_value}</p>
                <p>Goal: {keyResult.end_value}</p>
            </div>
        </div>
    </a>
</li>

<ConfirmationDialog show={showConfirmationDialog} message="Delete key result" onconfirm={onDeleteKeyResult} ondismiss={() => showConfirmationDialog = false} />
