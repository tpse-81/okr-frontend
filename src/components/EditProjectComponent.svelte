<script lang="ts">
import { _ } from "svelte-i18n";
import { updateProject } from "$lib/api";
import type { Project } from "$lib/types";
import IconSelector from "./IconSelector.svelte";

let {
	show,
	project,
	ondismiss,
}: {
	show: boolean;
	project: Project;
	ondismiss: () => void;
} = $props();

// svelte-ignore non_reactive_update
let modal: HTMLDialogElement;
// svelte-ignore state_referenced_locally
let name: string = $state(project.name);
// svelte-ignore state_referenced_locally
let deadline: Date = $state(project.deadline);
// svelte-ignore state_referenced_locally
let icon: string | null = $state(project.icon ?? null);
let iconRequiresConfirmation: boolean = $state(false);

$effect(() => {
	if (show) modal.showModal();
	else modal.close();
});

async function onUpdateproject() {
	project.name = name;
	project.deadline = deadline;
	project.icon = icon;

	await updateProject(project);

	ondismiss();
}
</script>

<dialog id="edit-project-modal" bind:this={modal} class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">{$_("projects.edit")}</h3>
    <form class="flex flex-col gap-3 mt-3">
      <IconSelector initialIcon={project.icon ?? null} onStateChanged={(newIcon, needsConfirm) => {icon = newIcon; iconRequiresConfirmation = needsConfirm;}} />

	    <input type="text" bind:value={name} placeholder="Name" class="input w-full">
	    <input type="text" bind:value={deadline} placeholder="Deadline" class="input w-full">
    </form>
    <div class="modal-action">
      <form method="dialog" class="flex gap-3 w-full justify-end">
        <button class="btn" onclick={ondismiss}>{$_("common.close")}</button>
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn btn-primary" onclick={onUpdateproject} disabled={iconRequiresConfirmation}>{$_("common.confirm")}</button>
      </form>
    </div>
  </div>
</dialog>
