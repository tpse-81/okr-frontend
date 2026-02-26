<script lang="ts">
import { _ } from "svelte-i18n";
import { updateObjective } from "$lib/api";
import type { Objective } from "$lib/types";

let {
	show,
	objective,
	ondismiss,
}: {
	show: boolean;
	objective: Objective;
	ondismiss: () => void;
} = $props();

// svelte-ignore non_reactive_update
let modal: HTMLDialogElement;
// svelte-ignore state_referenced_locally
let name: string = $state(objective.name);
// svelte-ignore state_referenced_locally
let description: string = $state(objective.description);

$effect(() => {
	if (show) modal.showModal();
	else modal.close();
});

async function onUpdateObjective() {
	objective.name = name;
	objective.description = description;

	await updateObjective(objective);

	ondismiss();
}
</script>

<dialog id="edit-objective-modal" bind:this={modal} class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">{$_("objectives.edit")}</h3>
   <form class="flex flex-col gap-3 mt-3">
  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">{$_("common.name")}</span>
    </div>
    <input
      type="text"
      bind:value={name}
      placeholder={$_("common.name")}
      class="input w-full"
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">{$_("common.description")}</span>
    </div>
    <input
      type="text"
      bind:value={description}
      placeholder={$_("common.description")}
      class="input w-full"
    />
  </label>
</form>
    <div class="modal-action">
      <form method="dialog" class="flex gap-3 w-full justify-end">
        <button class="btn" onclick={ondismiss}>{$_("common.close")}</button>
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn btn-primary" onclick={onUpdateObjective}>{$_("common.confirm")}</button>
      </form>
    </div>
  </div>
</dialog>
