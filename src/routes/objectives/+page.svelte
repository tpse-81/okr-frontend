<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { getObjectives } from "$lib/api";
import type { Objective } from "$lib/types";
import ObjectiveComponent from "../../components/Objective.svelte";

let objectivelist: Objective[] = $state([]);

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
</script>

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
