<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { createKeyResult, getKeyResultObjective } from "$lib/api";
import type { KeyResult } from "$lib/types";
import KeyResultComponent from "../../../components/KeyResult.svelte";

let { data } = $props();

let objectiveID = $derived(data.objectiveID);
let objectiveName = $derived(data.objectiveName);
let projectID = $derived(data.parentID);

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

async function handleSubmit() {
	await createKeyResult(
		description,
		endValue,
		startValue,
		objectiveID,
		projectID,
	);

	keyResultList = await getKeyResultObjective(objectiveID);
}
</script>

<h1>Create a Key Result for {objectiveName}</h1>

<form id="keyResultSubmit" onsubmit={handleSubmit} class="flex gap-3 p-3">
    <input type="text" bind:value={description} placeholder="description" class="input w-full">
    <input type="number" bind:value={startValue} placeholder="start value" class="input w-full">
    <input type="number" bind:value={endValue} placeholder="end value" class="input w-full">
    <input type="submit" value="Create" class="btn btn-primary">
</form>

<div class="p-3">
    <h1>Key Results for {objectiveName}</h1>
    {#if keyResultList.length > 0}
        <ul class="grid grid-auto gap-3">
            {#each keyResultList as keyResult}
			 	    	<KeyResultComponent keyResult={keyResult} onKeyResultDeleted={() => keyResultList = keyResultList.filter(kr => kr.id != keyResult.id)} />
            {/each}
        </ul>
    {:else}
        <p>Keine Key Results geladen</p>
    {/if}
</div>
