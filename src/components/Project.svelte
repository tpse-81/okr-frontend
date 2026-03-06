<!--
@component
- Component for displaying projects.
- Usage:
  ```html
  <Project project={project}>
  ```
-->
<script lang="ts">
import { Archive, Check, Edit, Info, RotateCcw, Trash } from "@lucide/svelte";
import { onMount } from "svelte";
import { _, locale } from "svelte-i18n";
import {
	archiveProject,
	deleteProject,
	getProjectPermission,
	unarchiveProject,
} from "$lib/api";
import type { ArchiveReason, Project } from "$lib/types";
import { formatDate, formatDeadline } from "$lib/utils";
import ArchiveProjectDialog from "./ArchiveProjectDialog.svelte";
import AvatarComponent from "./Avatar.svelte";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditProjectComponent from "./EditProjectComponent.svelte";
import ProjectBadge from "./ProjectBadge.svelte";
import UnarchiveProjectDialog from "./UnarchiveProjectDialog.svelte";

let {
	project,
	onProjectDeleted,
	onProjectUpdated,
	showEditActions = true,
}: {
	project: Project;
	showEditActions?: boolean;
	onProjectDeleted?: () => void;
	onProjectUpdated?: () => void;
} = $props();

let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);
let showArchiveDialog = $state(false);
let isArchiving = $state(false);
let showUnarchiveDialog = $state(false);
let isUnarchiving = $state(false);

let canEdit = $state(false);
let canDelete = $state(false);

// Load permissions when the component is mounted
onMount(async () => {
	try {
		const permissions = await getProjectPermission(project.id);
		canEdit = permissions.can_lead;
		canDelete = permissions.can_lead;
	} catch (err) {
		console.error("Failed to load project permissions", err);
	}
});

async function onDeleteProject() {
	showConfirmationDialog = false;
	if (canDelete && (await deleteProject(project.id))) onProjectDeleted?.();
}

async function onArchiveProject(reason: ArchiveReason) {
	showArchiveDialog = false;
	isArchiving = true;
	try {
		await archiveProject(project.id, reason);
		onProjectUpdated?.();
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
		onProjectUpdated?.();
	} catch (err) {
		console.error(err);
	} finally {
		isUnarchiving = false;
	}
}
</script>

<li class="card card-border relative">
		{#if showEditActions}
  	<div class="absolute right-2 top-2 flex gap-2"
         title={!canEdit ? $_("common.noPermissions") : ""}>
        {#if project.is_archived}
			<button
				class="btn btn-square"
				disabled={isUnarchiving || !canEdit}
				onclick={() => canEdit && (showUnarchiveDialog = true)}
				title="Unarchive"
			>
				<RotateCcw size="16" />
			</button>
        {:else}
			<button
				class="btn btn-square"
				disabled={isArchiving || !canEdit}
				onclick={() => canEdit && (showArchiveDialog = true)}
				title="Archive"
			>
				<Archive size="16" />
			</button>
		{/if}
        <button
                class="btn btn-square"
                onclick={() => canEdit && (showEditDialog = true)}
                disabled={!canEdit}
        >
            <Edit size="16" />
        </button>
        <button
                class="btn btn-square"
                onclick={() => canDelete && (showConfirmationDialog = true)}
                disabled={!canDelete}
        >
            <Trash size="16" />
        </button>
    </div>
    {/if}

    <a href={`/projects/${project.id}`} class="card-body pt-12">
    	<ProjectBadge project={project} />
			<div class="card-title flex mt-2 items-center gap-2">
  <AvatarComponent icon={project.icon ?? null} name={project.name} big={false} />
  <h2 class="min-w-0">
    <span class="line-clamp-1 break-words">
      {project.name}
    </span>
  </h2>
</div>
        <p>{$_("projects.createdAtLabel")} {formatDate(new Date(project.creation_date), $locale)}</p>
        <p>{$_("projects.dueAtLabel")} {formatDate(new Date(project.deadline), $locale)}</p>
    </a>
</li>

<EditProjectComponent
        show={showEditDialog}
        project={project}
        ondismiss={() => showEditDialog = false}
/>
<ConfirmationDialog
        show={showConfirmationDialog}
        message={$_("projects.delete")}
        onconfirm={onDeleteProject}
        ondismiss={() => showConfirmationDialog = false}
/>
<EditProjectComponent show={showEditDialog} project={project} ondismiss={() => showEditDialog = false} />
<ArchiveProjectDialog show={showArchiveDialog} projectName={project.name} onconfirm={(reason) => onArchiveProject(reason)} ondismiss={() => (showArchiveDialog = false)} />
<UnarchiveProjectDialog show={showUnarchiveDialog} projectName={project.name} initialDeadline={new Date(project.deadline)} onconfirm={(date) => onUnarchiveProject(date)} ondismiss={() => (showUnarchiveDialog = false)} />
<ConfirmationDialog show={showConfirmationDialog} message="Delete project" onconfirm={onDeleteProject} ondismiss={() => showConfirmationDialog = false} />
