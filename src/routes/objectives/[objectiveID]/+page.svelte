<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import { createKeyResult, getKeyResultObjective } from "$lib/api";
import type { KeyResult } from "$lib/types";
import KeyResultComponent from "../../../components/KeyResult.svelte";

let { data } = $props();

let objectiveID = $derived(data.objectiveID);
let objectiveName = $derived(data.objectiveName);

let keyResultList: KeyResult[] = $state([]);

let description: string = $state("");
let startValue: number = $state(0);
let endValue: number = $state(0);

onMount(async () => {
	try {
		await loadKeyResults();
	} catch (err) {
		console.error(err);
	}
});

async function loadKeyResults() {
	try {
		keyResultList = await getKeyResultObjective(objectiveID);
	} catch (err) {
		await goto("/expected");
	}
}

async function handleSubmit(e: SubmitEvent) {
	e.preventDefault();
	await createKeyResult(description, endValue, startValue, objectiveID);

	keyResultList = await getKeyResultObjective(objectiveID);
}
</script>

<h1>{$_("keyResults.createTitleForObjective", {values: {objectiveName: objectiveName}})}</h1>

<form id="keyResultSubmit" onsubmit={handleSubmit} class="flex gap-3 p-3">
    <input type="text" id="description" bind:value={description} placeholder={$_("common.description")} class="input w-full" required>
    <input type="number" step="any" id="start-value" bind:value={startValue} placeholder={$_("keyResults.start")} class="input w-full" required>
    <input type="number" step="any" id="end-value" bind:value={endValue} placeholder={$_("keyResults.target")} class="input w-full" required>
    <input type="submit" value="Create" class="btn btn-primary">
</form>

<div class="p-3">
    <h1>{$_("keyResults.titleForObjective", {values: {objectiveName: objectiveName}})}</h1>
    {#if keyResultList.length > 0}
        <ul id="key-results-list" class="grid grid-auto gap-3">
            {#each keyResultList as keyResult}
			 	    	<KeyResultComponent keyResult={keyResult} onKeyResultDeleted={() => keyResultList = keyResultList.filter(kr => kr.id != keyResult.id)} />
            {/each}
        </ul>
    {:else}
        <p>{$_("keyResults.empty")}</p>
    {/if}
</div>
