<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import {
	APIError,
	createObjective,
	getObjectiveProject,
	getProjectPermission,
	linkObjectiveToProject,
	unlinkObjectiveFromProject,
} from "$lib/api";
import type { Objective } from "$lib/types";
import AvatarComponent from "../../../components/Avatar.svelte";
import LinkObjectiveDialog from "../../../components/LinkObjectiveDialog.svelte";
import ObjectiveComponent from "../../../components/Objective.svelte";
import ProjectMembers from "../../../components/ProjectMembers.svelte";

let { data } = $props();

let project_id = $derived(data.project_id);
let project_name = $derived(data.project_name);
let project_icon = $derived(data.project_icon);

let objectivelist: Objective[] = $state([]);
let name: string = $state("");
let description: string = $state("");

let canCreate = $state(false);
let showLinkObjectivesModal = $state(false);

onMount(async () => {
	try {
		await objectives();
		const permissions = await getProjectPermission(project_id);
		canCreate = permissions.can_write;
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
          <div class="opacity-70">{$_("objectives.title")}</div>
        </div>
      </div>
    </div>
  </div>

  <ProjectMembers projectId={project_id} />

  <!-- Create Objective -->
  {#if canCreate}
    <div class="card bg-base-100 border border-base-300">
      <div class="card-body gap-4">
        <h2 class="card-title">{$_("objectives.createTitle")}</h2>

        <form id="objective-submit" onsubmit={handleSubmit} class="grid grid-auto gap-3">
          <div class="form-control">
            <label for="objective-name" class="label">
              <span class="label-text">{$_("common.name")}</span>
            </label>
            <input id="objective-name" type="text" bind:value={name} placeholder={$_("common.name")} class="input input-bordered w-full" required/>
          </div>

          <div class="form-control">
            <label for="objective-description" class="label">
              <span class="label-text">{$_("common.description")}</span>
            </label>
            <input id="objective-description" type="text" bind:value={description} placeholder={$_("common.description")} class="input input-bordered w-full" required/>
          </div>

          <div class="md:col-span-2 flex justify-end">
            <button type="submit" class="btn btn-primary">{$_("common.create")}</button>
          </div>
        </form>
      </div>
    </div>
    {/if}

  <!-- List of objectives (stays visible) -->
  <div class="card bg-base-100 border border-base-300">
    <div class="card-body gap-4">
      <div class="flex" >
        <h2 class="card-title flex-1">{$_("objectives.title")}</h2>
        <div title={!canCreate ? $_("common.noPermissions") : ""}>
        <button class="btn btn-primary" onclick={() => canCreate && (showLinkObjectivesModal = true)} disabled={!canCreate}>{$_("objectives.manageLinks")}</button>
        </div>
      </div>

      {#if objectivelist.length > 0}
        <ul id="objectives-list" class="grid grid-auto">
          {#each objectivelist as objective}
	        	<ObjectiveComponent objective={objective} onObjectiveDeleted={() => objectivelist = objectivelist.filter(obj => objective.id != obj.id)} />
          {/each}
        </ul>
      {:else}
        <p class="opacity-70">{$_("objectives.empty")}</p>
      {/if}
    </div>
  </div>

</div>

<LinkObjectiveDialog
  title={$_("projects.objectivesForTitle", { values: { projectName: project_name } })}
  initialLinked={objectivelist}
  showErrors={false} 

  writeChanges={async (toAdd, toRemove, confirmOrphan = false) => {
  const addJobs = toAdd.map((obj) => linkObjectiveToProject(project_id, obj.id));
  const orphanCandidates: Objective[] = [];

 const removeJobs = toRemove.map(async (obj) => {
  try {
    await unlinkObjectiveFromProject(project_id, obj.id, confirmOrphan);
  } catch (e: any) {
    if (!confirmOrphan && e instanceof APIError && e.response.status === 409) {
      orphanCandidates.push(obj);
      return;
    }
    throw e;
  }
});

  await Promise.all([...addJobs, ...removeJobs]);

  if (!confirmOrphan && orphanCandidates.length > 0) {
      const err: any = new Error("ORPHAN_CONFIRM_NEEDED");
      err.orphanObjectives = orphanCandidates;
      err.orphanObjectiveIds = orphanCandidates.map(o => o.id);
      throw err;
    }

  

  return [];
}}

  onLinkedChanged={(objectives) => (objectivelist = objectives)}
  ondismiss={() => (showLinkObjectivesModal = false)}
  show={showLinkObjectivesModal}
/>
