<script lang="ts">
import { getObjectives, createObjective } from "$lib/api";
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import type { Objective } from "$lib/types";
import { _ } from "svelte-i18n";

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

<h1>{$_('createObjective')}</h1>

<form id="objective-submit" onsubmit={createProjects} class="flex gap-3 p-3">
    <input type="text" bind:value={name} placeholder={$_('name')} class="input w-full">
    <input type="text" bind:value={description} placeholder={$_('description')} class="input w-full">
    <input type="text" bind:value={projectID} placeholder={$_('projectID')} class="input w-full">
    <input type="submit" value="Create" class="btn btn-primary">
</form>

<div class="p-3">
	<h1>{$_('objectives')}</h1>
	{#if objectivelist.length > 0}
	    <ul class="grid grid-auto gap-3">
	        {#each objectivelist as objective}
	            <li class="card card-border">
	                <a href={`/objectives/${objective.id}`} class="card-body">
	                    Name: <strong>{objective.name}</strong><br>
	                    Beschreibung: {objective.description}<br>
	                    <small>(ID: {objective.id})</small><br><br>
	                </a>
	            </li>
	        {/each}
	    </ul>
	{:else}
	    <p>Keine Objectives geladen</p>
	{/if}
</div>
