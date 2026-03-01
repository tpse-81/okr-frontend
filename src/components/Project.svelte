<!--
@component
- Component for displaying projects.
- Usage:
  ```html
  <Project project={project}>
  ```
-->
<script lang="ts">
import { Archive, Check, Edit, Info, Trash, RotateCcw } from "@lucide/svelte";
import { archiveProject, unarchiveProject, deleteProject } from "$lib/api";
import type { ArchiveReason, Project } from "$lib/types";
import { _, locale } from "svelte-i18n";
import { formatDate, formatDeadline } from "$lib/utils";
import AvatarComponent from "./Avatar.svelte";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditProjectComponent from "./EditProjectComponent.svelte";
import ArchiveProjectDialog from "./ArchiveProjectDialog.svelte";
import UnarchiveProjectDialog from "./UnarchiveProjectDialog.svelte"

let {
	project,
	onProjectDeleted,
    onProjectUpdated,
}: { project: Project; onProjectDeleted: () => void; onProjectUpdated?: () => void; } = $props();

let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);
let showArchiveDialog = $state(false);
let isArchiving = $state(false);
let showUnarchiveDialog = $state(false);
let isUnarchiving = $state(false);

type ArchiveMeta = { reason: ArchiveReason; format: string; badge: string };

const archiveReasons: ArchiveMeta[] = [
	{ reason: "finalized", format: "Finished", badge: "badge-success" },
	{ reason: "on_break", format: "On Break", badge: "badge-warning" },
	{ reason: "give_up", format: "Cancelled", badge: "badge-error" },
];

const archiveReasonMap = archiveReasons.reduce(
	(acc, r) => {
		acc[r.reason] = r;
		return acc;
	},
	{} as Record<ArchiveReason, ArchiveMeta>,
);

function getArchiveMeta(reason: ArchiveReason | null | undefined) {
	if (!reason) return { format: "Archived", badge: "badge-warning" };
	return archiveReasonMap[reason] ?? { format: reason, badge: "badge-warning" };
}

let archiveMeta = $derived(getArchiveMeta(project.archive_reason));

async function onDeleteProject() {
	showConfirmationDialog = false;

	if (await deleteProject(project.id)) onProjectDeleted();
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
  	<div class="absolute right-2 top-2 flex gap-2">
        {#if project.is_archived}
			<button
				class="btn btn-square"
				disabled={isUnarchiving}
				onclick={() => (showUnarchiveDialog = true)}
				title="Unarchive"
			>
				<RotateCcw size="16" />
			</button>
        {:else}
			<button
				class="btn btn-square"
				disabled={isArchiving}
				onclick={() => (showArchiveDialog = true)}
				title="Archive"
			>
				<Archive size="16" />
			</button>
		{/if}
		  <button class="btn btn-square" onclick={() => showEditDialog = true}><Edit size="16" /></button>
		  <button class="btn btn-square" onclick={() => showConfirmationDialog = true}><Trash size="16" /></button>
		</div>
    <a href={`/projects/${project.id}`} class="card-body">
        {#if project.is_archived}
			<div class={`badge ${archiveMeta.badge}`}>
				<Archive size="16" /> Archived: {archiveMeta.format}
			</div>
        {:else if project.done}
            <div class="badge badge-success"><Check size="16" /> Done</div>
        {:else}
            <div class="badge badge-info"><Info size="16" /> {formatDeadline(new Date(project.deadline), $locale)}</div>
        {/if}
        <div class="card-title flex mt-2">
            <AvatarComponent icon={project.icon ?? null} name={project.name} big={false} />
            <h2>{project.name}</h2>
        </div>
        <p>{$_("projects.createdAtLabel")} {formatDate(new Date(project.creation_date), $locale)}</p>
        <p>{$_("projects.dueAtLabel")} {formatDate(new Date(project.deadline), $locale)}</p>
    </a>
</li>

<EditProjectComponent show={showEditDialog} project={project} ondismiss={() => showEditDialog = false} />
<ArchiveProjectDialog show={showArchiveDialog} projectName={project.name} onconfirm={(reason) => onArchiveProject(reason)} ondismiss={() => (showArchiveDialog = false)} />
<UnarchiveProjectDialog show={showUnarchiveDialog} projectName={project.name} initialDeadline={new Date(project.deadline)} onconfirm={(date) => onUnarchiveProject(date)} ondismiss={() => (showUnarchiveDialog = false)} />
<ConfirmationDialog show={showConfirmationDialog} message="Delete project" onconfirm={onDeleteProject} ondismiss={() => showConfirmationDialog = false} />
