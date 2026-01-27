<script lang="ts">
import { getProjects, createProject } from "$lib/api";
import { onMount } from "svelte";
import type { Project } from "$lib/types";

let projectsList: Project[] = $state([]);
let name: string = $state("");
let deadline: number = $state(0);

let iconFiles: FileList;

let pendingIcon: File | null = $state(null);
let confirmedIcon: File | null = $state(null);
let previewUrl: string | null = $state(null);
let needsConfirm = $state(false);

onMount(async () => {
	try {
		projectsList = await getProjects();
	} catch (err) {
		console.error(err);
	}
});

function onIconChange() {
	const f = iconFiles?.item(0) ?? null;

	// reset
	pendingIcon = f;
	confirmedIcon = null;
	needsConfirm = !!f;

	if (previewUrl) URL.revokeObjectURL(previewUrl);
	previewUrl = f ? URL.createObjectURL(f) : null;
}

function confirmIcon() {
	confirmedIcon = pendingIcon;
	needsConfirm = false;
}

function discardIcon() {
	pendingIcon = null;
	confirmedIcon = null;
	needsConfirm = false;

	if (previewUrl) URL.revokeObjectURL(previewUrl);
	previewUrl = null;
}

async function handleSubmit() {
	await createProject(name, new Date(deadline), iconFiles.item(0));
	projectsList = await getProjects();
}
</script>

<h1>Create a Project</h1>

<form id="project-submit" onsubmit={handleSubmit} class="flex gap-3 p-3">
    <input type="file" accept="image/*" bind:files={iconFiles} onchange={onIconChange} class="file-input w-full">
    {#if previewUrl}
    <div class="card card-border p-3 gap-2">
      <div class="font-semibold">Preview</div>

      <img src={previewUrl} alt="Icon preview" class="max-h-32 w-auto rounded" />

      {#if needsConfirm}
        <div class="flex gap-2 items-center">
          <span>Do you want to use this logo?</span>
          <button type="button" class="btn btn-primary" onclick={confirmIcon}>Accept</button>
          <button type="button" class="btn" onclick={discardIcon}>Discard</button>
        </div>
      {:else if confirmedIcon}
        <div class="text-sm opacity-70">Logo changed</div>
      {/if}
    </div>
  {/if}
    <input type="text" bind:value={name} placeholder="Name" class="input w-full">
    <input type="number" bind:value={deadline} placeholder="Deadline" class="input w-full">
    <input type="submit" value="Create" class="btn btn-primary" disabled={needsConfirm}>
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
