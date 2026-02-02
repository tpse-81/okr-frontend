<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { createObjective, getObjectives } from "$lib/api";
import type { Objective } from "$lib/types";
import ObjectiveComponent from "../../components/Objective.svelte";

let objectivelist: Objective[] = $state([]);
let name: string = $state("");
let description: string = $state("");
let projectID: string = $state("");

onMount(async () => {
	try {
		await objectives();
	} catch (err) {
		console.error(err);
	}
});

async function objectives() {
	try {
		objectivelist = await getObjectives();
	} catch (err) {
		await goto("/expected");
	}
}

async function createProjects() {
	await createObjective(name, description, projectID);
}
</script>

<h1>Create an Objective</h1>

<form id="objective-submit" onsubmit={createProjects} class="flex gap-3 p-3">
    <input type="text" bind:value={name} placeholder="Name" class="input w-full">
    <input type="text" bind:value={description} placeholder="Deadline" class="input w-full">
    <input type="text" bind:value={projectID} placeholder="project id" class="input w-full">
    <input type="submit" value="Create" class="btn btn-primary">
</form>

<div class="p-3">
	<h1>Objectives</h1>
	{#if objectivelist.length > 0}
	    <ul class="grid grid-auto gap-3">
	        {#each objectivelist as objective}
	        	<ObjectiveComponent objective={objective} onObjectiveDeleted={() => objectivelist = objectivelist.filter(obj => objective.id != obj.id)} />
	        {/each}
	    </ul>
	{:else}
	    <p>Keine Objectives geladen</p>
	{/if}
</div>
