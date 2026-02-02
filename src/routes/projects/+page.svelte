<script lang="ts">
import { onMount } from "svelte";
import { createProject, getProjects } from "$lib/api";
import type { Project } from "$lib/types";
import IconSelector from "../../components/IconSelector.svelte";
import ProjectComponent from "../../components/Project.svelte";

let projectsList: Project[] = $state([]);
let name: string = $state("");
let deadline: number = $state(0);
let icon: string | null = $state(null);
let iconRequiresConfirmation: boolean = $state(false);

onMount(async () => {
	try {
		projectsList = await getProjects();
	} catch (err) {
		console.error(err);
	}
});

async function handleSubmit() {
	await createProject(name, new Date(deadline), icon);
	projectsList = await getProjects();
	name = "";
	deadline = 0;
}
</script>

<h1>Create a Project</h1>

<form id="project-submit" onsubmit={handleSubmit} class="p-3">
  <div class="card bg-base-100 border border-base-300">
    <div class="card-body gap-4">

      <h2 class="card-title">Create a Project</h2>

      <IconSelector initialIcon={null} onStateChanged={(newIcon, needsConfirm) => {icon = newIcon; iconRequiresConfirmation = needsConfirm;}} />

      <!-- Inputs: nice grid -->
      <div class="grid grid-auto gap-3">
        <div class="form-control">
            <label for="project-name" class="label">
                <span class="label-text">Name</span>
            </label>
            <input
                id="project-name"
                type="text"
                bind:value={name}
                placeholder="Name"
                class="input input-bordered w-full"
            />
        </div>

        <div class="form-control">
            <label for="project-deadline" class="label">
                <span class="label-text">Deadline</span>
            </label>
            <input
                id="project-deadline"
                type="date"
                bind:value={deadline}
                placeholder="Deadline"
                class="input input-bordered w-full"
            />
        </div>
      </div>

      <div class="card-actions justify-end">
        <button class="btn btn-primary" type="submit" disabled={iconRequiresConfirmation}>
          Create
        </button>
      </div>
    </div>
  </div>
</form>

<div class="p-3">
  <h1>Projects</h1>
  {#if projectsList.length > 0}
      <ul class="grid gap-3 grid-auto">
          {#each projectsList as project}
            <ProjectComponent project={project} onProjectDeleted={() => projectsList = projectsList.filter(proj => proj.id != project.id)} />
          {/each}
      </ul>
  {:else}
      <p>Keine Projekte geladen</p>
  {/if}
</div>
