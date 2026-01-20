<script lang="ts">
import { onMount } from "svelte";
import { createProject, getProjects } from "$lib/api";
import type { Project } from "$lib/types";
import ProjectComponent from "../../components/Project.svelte";

let projectsList: Project[] = $state([]);
let name: string = $state("");
let deadline: number = $state(0);

let iconInput: HTMLInputElement;
let iconFiles: FileList | null;

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
	needsConfirm = f != null;

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

	iconInput.value = "";
}

async function handleSubmit() {
	await createProject(name, new Date(deadline), iconFiles?.item(0) ?? null);
	projectsList = await getProjects();
	name = "";
	deadline = 0;
	discardIcon();
}
</script>

<h1>Create a Project</h1>

<form id="project-submit" onsubmit={handleSubmit} class="p-3">
  <div class="card bg-base-100 border border-base-300">
    <div class="card-body gap-4">

      <h2 class="card-title">Create a Project</h2>

      <div class="form-control">
        <label for="project-logo" class="label">
            <span class="label-text">Projekt-Logo</span>
        </label>

        <input
            id="project-logo"
            type="file"
            accept="image/*"
            bind:this={iconInput}
            bind:files={iconFiles}
            onchange={onIconChange}
            class="file-input file-input-bordered w-full"
        />
      </div>


      <!-- Preview + Confirm -->
      {#if previewUrl}
        <div class="alert flex flex-col gap-3">
          <div class="w-full">
            <div class="text-sm font-semibold mb-2">Preview</div>
            <div class="h-32 w-full rounded bg-base-200 flex items-center justify-center overflow-hidden">
              <img src={previewUrl} alt="Logo preview" class="h-full w-full object-contain" />
            </div>
          </div>

          {#if needsConfirm}
            <div class="w-full flex flex-col gap-2">
              <div class="text-sm whitespace-normal">
                Do you really want to use this logo?
              </div>
              <div class="flex gap-2 flex-wrap">
                <button type="button" class="btn btn-primary" onclick={confirmIcon}>Accept</button>
                <button type="button" class="btn btn-ghost" onclick={discardIcon}>Discard</button>
              </div>
            </div>
          {:else if confirmedIcon}
            <div class="w-full text-sm opacity-80">
              Logo accepted
            </div>
          {/if}
        </div>
      {/if}

      <!-- Inputs: nice grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        <button class="btn btn-primary" type="submit" disabled={needsConfirm}>
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
            <ProjectComponent project={project} />
          {/each}
      </ul>
  {:else}
      <p>Keine Projekte geladen</p>
  {/if}
</div>
