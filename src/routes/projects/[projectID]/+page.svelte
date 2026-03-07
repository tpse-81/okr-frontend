<script lang="ts">
import { Archive, Edit, RotateCcw, Trash } from "@lucide/svelte";
import { onMount } from "svelte";
import { _, locale } from "svelte-i18n";
import { goto } from "$app/navigation";
import {
	APIError,
	archiveProject,
	createObjective,
	deleteProject,
	getObjectiveProject,
	getProjectPermission,
	linkObjectiveToProject,
	unarchiveProject,
	unlinkObjectiveFromProject,
} from "$lib/api";
import type { ArchiveReason, Objective, Project } from "$lib/types";
import { formatDate } from "$lib/utils";
import ArchiveProjectDialog from "../../../components/ArchiveProjectDialog.svelte";
import AvatarComponent from "../../../components/Avatar.svelte";
import ConfirmationDialog from "../../../components/ConfirmationDialog.svelte";
import EditProjectComponent from "../../../components/EditProjectComponent.svelte";
import LinkObjectiveDialog from "../../../components/LinkObjectiveDialog.svelte";
import ObjectiveComponent from "../../../components/Objective.svelte";
import ProjectBadge from "../../../components/ProjectBadge.svelte";
import ProjectMembers from "../../../components/ProjectMembers.svelte";
// biome-ignore lint/style/useImportType: Svelte component is needed at runtime
import SuccessDialog from "../../../components/SuccessDialog.svelte";
import UnarchiveProjectDialog from "../../../components/UnarchiveProjectDialog.svelte";

let { data } = $props();

// svelte-ignore state_referenced_locally
let project: Project = $state(data.project);

let showEditDialog = $state(false);
let showConfirmationDialog = $state(false);
let showArchiveDialog = $state(false);
let showUnarchiveDialog = $state(false);

let isArchiving = $state(false);
let isUnarchiving = $state(false);
let canLead = $state(false);

let objectivelist: Objective[] = $state([]);
let name: string = $state("");
let description: string = $state("");

let canCreate = $state(false);
let showLinkObjectivesModal = $state(false);

let successToast: SuccessDialog;

onMount(async () => {
	try {
		await objectives();
		const permissions = await getProjectPermission(project.id);
		canCreate = permissions.can_write;
		canLead = permissions.can_lead;
	} catch (err) {
		console.error(err);
	}
});

async function objectives() {
	try {
		objectivelist = await getObjectiveProject(project.id);
	} catch (err) {
		await goto("/expected");
	}
}

async function handleSubmit(e: SubmitEvent) {
	e.preventDefault();
	try {
		await createObjective(name, description, project.id);
		successToast.displayMessage($_("objectives.success"));
	} catch (err) {
		console.error(err);
	}
	objectivelist = await getObjectiveProject(project.id);
	name = "";
	description = "";
}

async function onArchiveProject(reason: ArchiveReason) {
	showArchiveDialog = false;
	isArchiving = true;
	try {
		await archiveProject(project.id, reason);
		project.is_archived = true;
		project.archive_reason = reason;
	} catch (err) {
		console.error(err);
	} finally {
		isArchiving = false;
	}
}

async function onUnarchiveProject(newDeadline: Date) {
	showUnarchiveDialog = false;
	isUnarchiving = true;
	try {
		await unarchiveProject(project.id, newDeadline);
		project.deadline = newDeadline;
	} catch (err) {
		console.error(err);
	} finally {
		isUnarchiving = false;
	}
}

async function onDeleteProject() {
	showConfirmationDialog = false;

	if (!canLead) return;

	try {
		await deleteProject(project.id);
		await goto("/projects");
	} catch (err) {
		console.error(err);
	}
}
</script>

<div class="p-3 space-y-6">
	<!-- Header -->
	<div class="card bg-base-100 border border-base-300">
		<div class="card-body">
			<div class="absolute top-2 right-3 flex flex-col items-end gap-2">
				<span class="badge badge-primary">{$_("projects.singular")}</span>

				<div
					class="flex gap-2"
					title={!canLead ? $_("common.noPermissions") : ""}
				>
					{#if project.is_archived}
						<button
							class="btn btn-square"
							disabled={isUnarchiving || !canLead}
							onclick={() => canLead && (showUnarchiveDialog = true)}
						>
							<RotateCcw size="16" />
						</button>
					{:else}
						<button
							class="btn btn-square"
							disabled={isArchiving || !canLead}
							onclick={() => canLead && (showArchiveDialog = true)}
						>
							<Archive size="16" />
						</button>
					{/if}

					<button
						class="btn btn-square"
						disabled={!canLead}
						onclick={() => canLead && (showEditDialog = true)}
					>
						<Edit size="16" />
					</button>

					<button
						class="btn btn-square"
						disabled={!canLead}
						onclick={() => canLead && (showConfirmationDialog = true)}
					>
						<Trash size="16" />
					</button>
				</div>
			</div>
			<div class="absolute top-2 left-2 z-1"><ProjectBadge {project} /></div>
			<div class="flex items-center gap-4 mt-5">
				<AvatarComponent
					icon={project.icon ?? null}
					name={project.name}
					big={true}
				/>
				<div class="min-w-0">
					<div class="text-2xl font-bold truncate max-w-full">
						{project.name}
					</div>
					<p>
						{$_("projects.createdAtLabel")}
						{formatDate(new Date(project.creation_date), $locale)}
					</p>
				</div>
			</div>
		</div>
	</div>

	<ProjectMembers projectId={project.id} />

	<!-- Create Objective -->
	{#if canCreate}
		<div class="card bg-base-100 border border-base-300">
			<div class="card-body gap-4">
				<h2 class="card-title">{$_("objectives.createTitle")}</h2>

				<form
					id="objective-submit"
					onsubmit={handleSubmit}
					class="grid grid-auto gap-3"
				>
					<div class="form-control">
						<label for="objective-name" class="label">
							<span class="label-text">{$_("common.name")}</span>
						</label>
						<input
							id="objective-name"
							type="text"
							bind:value={name}
							placeholder={$_("common.name")}
							class="input input-bordered w-full"
							required
						>
					</div>

					<div class="form-control">
						<label for="objective-description" class="label">
							<span class="label-text">{$_("common.description")}</span>
						</label>
						<input
							id="objective-description"
							type="text"
							bind:value={description}
							placeholder={$_("common.description")}
							class="input input-bordered w-full"
							required
						>
					</div>

					<div class="md:col-span-2 flex justify-end">
						<button type="submit" class="btn btn-primary">
							{$_("common.create")}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- List of objectives (stays visible) -->
	<div class="card bg-base-100 border border-base-300">
		<div class="card-body gap-4">
			<div class="flex">
				<h2 class="card-title flex-1">{$_("objectives.title")}</h2>
				<div title={!canCreate ? $_("common.noPermissions") : ""}>
					<button
						class="btn btn-primary"
						onclick={() => canCreate && (showLinkObjectivesModal = true)}
						disabled={!canCreate}
					>
						{$_("objectives.manageLinks")}
					</button>
				</div>
			</div>

			{#if objectivelist.length > 0}
				<ul id="objectives-list" class="grid grid-auto">
					{#each objectivelist as objective}
						<ObjectiveComponent
							{objective}
							onObjectiveDeleted={() => objectivelist = objectivelist.filter(obj => objective.id != obj.id)}
						/>
					{/each}
				</ul>
			{:else}
				<p class="opacity-70">{$_("objectives.empty")}</p>
			{/if}
		</div>
	</div>
</div>

<LinkObjectiveDialog
	title={$_("projects.objectivesForTitle", { values: { projectName: project.name } })}
	initialLinked={objectivelist}
	showErrors={false}
	writeChanges={async (toAdd, toRemove, confirmOrphan = false) => {
  const addJobs = toAdd.map((obj) => linkObjectiveToProject(project.id, obj.id));
  const orphanCandidates: Objective[] = [];

 const removeJobs = toRemove.map(async (obj) => {
  try {
    await unlinkObjectiveFromProject(project.id, obj.id, confirmOrphan);
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

<EditProjectComponent
	show={showEditDialog}
	{project}
	ondismiss={() => (showEditDialog = false)}
/>

<ArchiveProjectDialog
	show={showArchiveDialog}
	projectName={project.name}
	onconfirm={(reason) => onArchiveProject(reason)}
	ondismiss={() => (showArchiveDialog = false)}
/>

<UnarchiveProjectDialog
	show={showUnarchiveDialog}
	projectName={project.name}
	initialDeadline={new Date(project.deadline)}
	onconfirm={(date) => onUnarchiveProject(date)}
	ondismiss={() => (showUnarchiveDialog = false)}
/>

<ConfirmationDialog
	show={showConfirmationDialog}
	message={$_("projects.delete")}
	onconfirm={onDeleteProject}
	ondismiss={() => (showConfirmationDialog = false)}
/>

<SuccessDialog bind:this={successToast}></SuccessDialog>
