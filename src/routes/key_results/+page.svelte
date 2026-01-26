<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import {
	createKeyResult,
	getKeyResultObjective,
	getKeyResults,
} from "$lib/api";
import type { KeyResult } from "$lib/types";

let keyResultList: KeyResult[] = $state([]);
let description: string = $state("");
let startValue: number = $state(0);
let endValue: number = $state(0);
let projectID: string = $state("");
let objectiveID: string = $state("");

onMount(async () => {
	try {
		await keyResults();
	} catch (err) {
		console.error(err);
	}
});

async function keyResults() {
	try {
		keyResultList = await getKeyResults();
	} catch (err) {
		await goto("/expected");
	}
}

async function handleSubmit() {
	console.log(`liste${keyResultList}`);
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


<h1>Create a Key Result</h1>

<form id="key_result-submit" onsubmit={handleSubmit} class="flex p-3 gap-3">
    <input type="text" bind:value={projectID} placeholder="project id" class="input w-full">
    <input type="text" bind:value={objectiveID} placeholder="objective id" class="input w-full">
    <input type="text" bind:value={description} placeholder="description" class="input w-full">
    <input type="number" bind:value={startValue} placeholder="start value" class="input w-full">
    <input type="number" bind:value={endValue} placeholder="end value" class="input w-full">
    <input type="submit" value="Create" class="btn btn-primary">
</form>

<div class="p-3">
	<h1>Key Results</h1>
	{#if keyResultList.length > 0}
	    <ul class="grid grid-auto gap-3">
	        {#each keyResultList as key_result}
	            <li class="card card-border">
	            		<div class="card-body">
		                Beschreibung: <strong>{key_result.description}</strong><br>
		                Start Value: {key_result.startValue}<br>
		                End Value: {key_result.endValue}<br>
		                <small>(ID: {key_result.id})</small><br><br>
	                </div>
	            </li>
	        {/each}
	    </ul>
	{:else}
	    <p>Keine Key Results geladen</p>
	{/if}
</div>
