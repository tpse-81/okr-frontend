<!--
@component
- Component for displaying key results.
- Usage:
  ```html
  <KeyResult keyResult={keyResult}>
  ```
-->
<script lang="ts">
import { Archive, Edit, MinusCircle, PlusCircle, Trash } from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import {
	deleteKeyResult,
	getKeyResultPermission,
	updateKeyResultCurrentValue,
} from "$lib/api";
import type { KeyResult } from "$lib/types";
import { isBetween } from "$lib/utils";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditKeyResultComponent from "./EditKeyResultComponent.svelte";
import ErrorMessage from "./ErrorMessage.svelte";
import KeyResultProgress from "./KeyResultProgress.svelte";

let errorMessage: string | null = $state(null);

let {
	keyResult,
	onKeyResultDeleted,
}: { keyResult: KeyResult; onKeyResultDeleted: () => void } = $props();

const isArchived = $derived(keyResult.is_archived === true);

let canEdit = $state(false);

onMount(async () => {
	try {
		const permissions = await getKeyResultPermission(keyResult.id);
		canEdit = permissions.can_write;
	} catch (err) {
		console.error("Failed to load project permissions", err);
	}
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
		errorMessage = $_("keyResults.outOfBoundsError");
		return;
	}

	try {
		const updated = await updateKeyResultCurrentValue(keyResult.id, nextValue);
		keyResult.current_value = updated.current_value;
	} catch (err) {
		console.error(err);
		errorMessage = null;
		errorMessage = $_("keyResults.updateError");
	}
}

let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);

async function onDeleteKeyResult() {
	showConfirmationDialog = false;

	if (await deleteKeyResult(keyResult.id)) onKeyResultDeleted?.();
}
</script>

<li class="card card-border relative">
		<div class="absolute right-2 top-2 flex gap-2" title={!canEdit ? $_("common.noPermissions") : ""}>
		  <button class="btn btn-square" onclick={() => canEdit && (showEditDialog = true)} disabled={!canEdit}><Edit size="16" /></button>
		  <button class="btn btn-square" onclick={() => canEdit && (showConfirmationDialog = true)} disabled={!canEdit}><Trash size="16" /></button>
        </div>
    <a href={`/key_results/${keyResult.id}`} class="card-body pt-12">
		{#if isArchived}
			<div class="badge badge-warning">
				<Archive size="16" /> {$_("common.archived")}
			</div>
		{/if}
        <h2 class="card-title">
  <span class="line-clamp-1 break-words">
    {keyResult.description}
  </span>
</h2>
        <div class="flex gap-4">
        		<KeyResultProgress keyResult={keyResult} />
            <div>
                <p>{$_("keyResults.start")}: {keyResult.start_value}</p>
                <p>{$_("keyResults.current")}: {keyResult.current_value}</p>
                <p>{$_("keyResults.target")}: {keyResult.end_value}</p>
            </div>
        </div>
    </a>
    <div class="-mt-2 ml-5 mb-3" title={!canEdit ? $_("common.noPermissions") : ""}>
        <button class="btn btn-square" onclick={incrementCurrentValue} disabled={!canEdit}>
            <PlusCircle size="16" />
        </button>
        <button class="btn btn-square" onclick={decrementCurrentValue} disabled={!canEdit}>
            <MinusCircle size="16" />
        </button>
    </div>
    <ErrorMessage message={errorMessage} />
</li>

<EditKeyResultComponent show={showEditDialog} keyResult={keyResult} ondismiss={() => showEditDialog = false} />
<ConfirmationDialog show={showConfirmationDialog} message={$_("keyResults.delete")} onconfirm={onDeleteKeyResult} ondismiss={() => showConfirmationDialog = false} />
