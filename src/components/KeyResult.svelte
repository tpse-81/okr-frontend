<!--
@component
- Component for displaying key results.
- Usage:
  ```html
  <KeyResult keyResult={keyResult}>
  ```
-->
<script lang="ts">
import { Edit, Trash } from "@lucide/svelte";
import { deleteKeyResult } from "$lib/api";
import type { KeyResult } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditKeyResultComponent from "./EditKeyResultComponent.svelte";

let {
	keyResult,
	onKeyResultDeleted,
}: { keyResult: KeyResult; onKeyResultDeleted: () => void } = $props();

let progress = $derived((keyResult.start_value / keyResult.end_value) * 100);

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
                <p>Current: {keyResult.start_value}</p>
                <p>Goal: {keyResult.end_value}</p>
            </div>
        </div>
    </a>
</li>

<EditKeyResultComponent show={showEditDialog} keyResult={keyResult} ondismiss={() => showEditDialog = false} />
<ConfirmationDialog show={showConfirmationDialog} message="Delete key result" onconfirm={onDeleteKeyResult} ondismiss={() => showConfirmationDialog = false} />
