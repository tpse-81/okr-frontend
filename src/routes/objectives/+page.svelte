<script lang="ts">
import { InfoIcon } from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
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
	<div role="alert" class="alert alert-vertical alert-outline sm:alert-horizontal">
		<InfoIcon/>
		<div>
			<h3 class="font-bold">{$_("objectives.cantCreate")}</h3>
			<div class="text-xs">{$_("objectives.selectProject")}</div>
		</div>
		<a href="/projects">
			<button class="btn btn-sm btn-outline">{$_("nav.goto")} {$_("projects.title")}</button>
		</a>
	</div>
</div>

<div class="p-3">
	<h1>{$_("objectives.title")}</h1>
	{#if objectivelist.length > 0}
	    <ul class="grid grid-auto gap-3">
	        {#each objectivelist as objective}
	        	<ObjectiveComponent objective={objective} onObjectiveDeleted={() => objectivelist = objectivelist.filter(obj => objective.id != obj.id)} />
	        {/each}
	    </ul>
	{:else}
	    <p>{$_("objectives.empty")}</p>
	{/if}
</div>
