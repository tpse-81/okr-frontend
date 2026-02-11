<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { createObjective, getObjectiveProject } from "$lib/api";
import type { Objective } from "$lib/types";
import AvatarComponent from "../../../components/Avatar.svelte";
import ObjectiveComponent from "../../../components/Objective.svelte";

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

async function handleSubmit(e: SubmitEvent) {
	e.preventDefault();
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
        <AvatarComponent icon={project_icon ?? null} name={project_name} big={true} />
        <div class="min-w-0">
          <div class="text-2xl font-bold truncate">{project_name}</div>
          <div class="opacity-70">Objectives</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Objective -->
  <div class="card bg-base-100 border border-base-300">
    <div class="card-body gap-4">
      <h2 class="card-title">Create an Objective</h2>

      <form id="objective-submit" onsubmit={handleSubmit} class="grid grid-auto gap-3">
        <div class="form-control">
          <label for="objective-name" class="label">
            <span class="label-text">Name</span>
          </label>
          <input id="objective-name" type="text" bind:value={name} placeholder="Name" class="input input-bordered w-full" required/>
        </div>

        <div class="form-control">
          <label for="objective-description" class="label">
            <span class="label-text">Description</span>
          </label>
          <input id="objective-description" type="text" bind:value={description} placeholder="Description" class="input input-bordered w-full" required/>
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
        <ul id="objectives-list" class="grid grid-auto">
          {#each objectivelist as objective}
	        	<ObjectiveComponent objective={objective} onObjectiveDeleted={() => objectivelist = objectivelist.filter(obj => objective.id != obj.id)} />
          {/each}
        </ul>
      {:else}
        <p class="opacity-70">Keine Objectives geladen</p>
      {/if}
    </div>
  </div>

</div>

