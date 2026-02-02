<!--
@component
- Component for displaying projects.
- Usage:
  ```html
  <Project project={project}>
  ```
-->
<script lang="ts">
import { Check, Edit, Info, Trash } from "@lucide/svelte";
import { deleteProject } from "$lib/api";
import type { Project } from "$lib/types";
import { formatDate, formatDeadline } from "$lib/utils";
import AvatarComponent from "./Avatar.svelte";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditProjectComponent from "./EditProjectComponent.svelte";

let {
	project,
	onProjectDeleted,
}: { project: Project; onProjectDeleted: () => void } = $props();

let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);

async function onDeleteProject() {
	showConfirmationDialog = false;

	if (await deleteProject(project.id)) onProjectDeleted();
}
</script>

<li class="card card-border relative">
  	<div class="absolute right-2 top-2 flex gap-2">
		  <button class="btn btn-square" onclick={() => showEditDialog = true}><Edit size="16" /></button>
		  <button class="btn btn-square" onclick={() => showConfirmationDialog = true}><Trash size="16" /></button>
		</div>
    <a href={`/projects/${project.id}`} class="card-body">
        {#if project.done}
            <div class="badge badge-success self-end"><Check size="16" /> Done</div>
        {:else}
            <div class="badge badge-info self-end"><Info size="16" /> {formatDeadline(new Date(project.deadline))}</div>
        {/if}
        <div class="card-title flex">
            <AvatarComponent icon={project.icon ?? null} name={project.name} big={false} />
            <h2>{project.name}</h2>
        </div>
        <p>Erstellt am {formatDate(new Date(project.creation_date))}</p>
        <p>Fällig am {formatDate(new Date(project.deadline))}</p>
    </a>
</li>

<EditProjectComponent show={showEditDialog} project={project} ondismiss={() => showEditDialog = false} />
<ConfirmationDialog show={showConfirmationDialog} message="Delete project" onconfirm={onDeleteProject} ondismiss={() => showConfirmationDialog = false} />
