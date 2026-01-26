<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { createObjective, getObjectiveProject } from "$lib/api";
import type { Objective } from "$lib/types";

let { data } = $props();

let project_id = $derived(data.project_id);
let project_name = $derived(data.project_name);
let project_icon = $derived(data.project_icon);

let objectivelist: Objective[] = $state([]);
let name: string = $state("");
let description: string = $state("");

onMount(async () => {
	try {
		await objectives();
	} catch (err) {
		console.error(err);
	}
});

async function objectives() {
	try {
		objectivelist = await getObjectiveProject(project_id);
	} catch (err) {
		await goto("/expected");
	}
}

async function handleSubmit() {
	await createObjective(name, description, project_id);
	objectivelist = await getObjectiveProject(project_id);
	name = "";
	description = "";
}
</script>

<div class="p-3 space-y-6">

  <!-- Header -->
  <div class="card bg-base-100 border border-base-300">
    <div class="card-body">
      <div class="flex items-center gap-4">
        <div class="avatar">
          <div class="w-16 h-16 rounded bg-base-200">
            {#if project_icon}
              <img src={project_icon} alt="Project logo" class="object-contain" />
            {:else}
              <div class="flex items-center justify-center h-full text-lg opacity-60">
                {project_name?.[0] ?? "?"}
              </div>
            {/if}
          </div>
        </div>

        <div class="min-w-0">
          <div class="text-2xl font-bold truncate">Objectives</div>
          <div class="opacity-70">{project_name}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Objective -->
  <div class="card bg-base-100 border border-base-300">
    <div class="card-body gap-4">
      <h2 class="card-title">Create an Objective</h2>

      <form id="objective-submit" onsubmit={handleSubmit} class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-control">
          <label for="objective-name" class="label">
            <span class="label-text">Name</span>
          </label>
          <input id="objective-name" type="text" bind:value={name} placeholder="Name" class="input input-bordered w-full" />
        </div>

        <div class="form-control">
          <label for="objective-description" class="label">
            <span class="label-text">Description</span>
          </label>
          <input id="objective-description" type="text" bind:value={description} placeholder="Description" class="input input-bordered w-full" />
        </div>

        <div class="md:col-span-2 flex justify-end">
          <button type="submit" class="btn btn-primary">Create</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Liste der Objectives (bleibt sichtbar) -->
  <div class="card bg-base-100 border border-base-300">
    <div class="card-body gap-4">
      <h2 class="card-title">Objectives</h2>

      {#if objectivelist.length > 0}
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {#each objectivelist as objective}
            <li class="card card-border hover:bg-base-200 transition-colors">
              <a href={`/objectives/${objective.id}`} class="card-body">
                <strong class="text-lg">{objective.name}</strong>
                <div class="opacity-80">{objective.description}</div>
                <div class="text-sm opacity-60">(ID: {objective.id})</div>
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="opacity-70">Keine Objectives geladen</p>
      {/if}
    </div>
  </div>

</div>

