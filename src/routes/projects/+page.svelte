<script lang="ts">
import { getProjects, createProject } from "$lib/api";
import { onMount } from "svelte";
import type { Project } from "$lib/types";

let projectsList: Project[] = $state([]);
let name: string = $state("");
let deadline: number = $state(0);

onMount(async () => {
	try {
		projectsList = await getProjects();
	} catch (err) {
		console.error(err);
	}
});

async function handleSubmit() {
	await createProject(name, new Date(deadline));
	projectsList = await getProjects();
}
</script>

<h1>Create a Project</h1>

<form id="project-submit" onsubmit={handleSubmit} class="flex gap-3 p-3">
    <input type="text" bind:value={name} placeholder="Name" class="input w-full">
    <input type="date" bind:value={deadline} placeholder="Deadline" class="input w-full">
    <input type="submit" value="Create" class="btn btn-primary">
</form>

<div class="p-3">
  <h1>Projekte</h1>
  {#if projectsList.length > 0}
      <ul class="grid gap-3 grid-auto">
          {#each projectsList as project}
              <li class="card card-border">
                  <a href={`/projects/${project.id}`} class="card-body">
                      <strong>{project.name}</strong><br>
                      Erstellt: {project.creation_date}<br>
                      Deadline: {project.deadline}<br>
                      Fertig: {project.done ? "Ja" : "Nein"}<br>
                      <small>(ID: {project.id})</small>
                  </a>
              </li>
          {/each}
      </ul>
  {:else}
      <p>Keine Projekte geladen</p>
  {/if}
</div>
