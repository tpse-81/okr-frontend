<!--
@component
- Dialog component for linking projects to tasks.
- Usage:
  ```html
  <LinkProjectObjectiveComponent >
  ```
-->
<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import {
	getObjectives,
	linkObjectiveToProject,
	unlinkObjectiveFromProject,
} from "$lib/api";
import type { Objective } from "$lib/types";
import LinkedObjectiveRow from "./LinkedObjectiveRow.svelte";

let {
	projectId,
	projectName,
	linkedObjectives: linkedObjectivesInitial,
	onLinkedObjectivesChanged,
	show,
	ondismiss,
}: {
	projectId: string;
	projectName: string;
	linkedObjectives: Objective[];
	onLinkedObjectivesChanged: (objectives: Objective[]) => void;
	show: boolean;
	ondismiss: () => void;
} = $props();

let modal: HTMLDialogElement;
let unlinkedObjectivesInitial: Objective[] = $state([]);

$effect(() => {
	if (show) modal.showModal();
	else modal.close();
});

// keep a copy of the resulting list of objectives with their state
// after the update would be applied
// the actual changes are only applied if the user confirms them!
let linkedObjectives: Objective[] = $state([]);
let unlinkedObjectives: Objective[] = $state([]);

onMount(async () => {
	const objectives: Objective[] = await getObjectives();
	unlinkedObjectivesInitial = objectives.filter(
		(obj) => !linkedObjectivesInitial.some((linked) => linked.id === obj.id),
	);

	unlinkedObjectives = unlinkedObjectivesInitial;
	linkedObjectives = linkedObjectivesInitial;
});

function onIsLinkedChanged(objective: Objective, isLinked: boolean) {
	if (isLinked) {
		// project and objective are now linked together -> update UI state
		unlinkedObjectives = unlinkedObjectives.filter(
			(obj) => obj.id !== objective.id,
		);
		linkedObjectives = [...linkedObjectives, objective];
	} else {
		// project and objective are no longer linked together -> update UI state
		linkedObjectives = linkedObjectives.filter(
			(obj) => obj.id !== objective.id,
		);
		unlinkedObjectives = [...unlinkedObjectives, objective];
	}
}

async function writeLinkingChanges() {
	// Persist all user-made changes to the API
	// This should only be called if the user confirmed it!
	const toAdd = linkedObjectives.filter(
		(obj) => !linkedObjectivesInitial.some((linked) => obj.id === linked.id),
	);
	const toRemove = unlinkedObjectives.filter(
		(obj) =>
			!unlinkedObjectivesInitial.some((unlinked) => obj.id === unlinked.id),
	);

	const addJobs = toAdd.map((obj) => linkObjectiveToProject(projectId, obj.id));
	const removeJobs = toRemove.map((obj) =>
		unlinkObjectiveFromProject(projectId, obj.id),
	);

	await Promise.all([...addJobs, removeJobs]);
}

async function onconfirm() {
	await writeLinkingChanges();
	onLinkedObjectivesChanged(linkedObjectives);
	ondismiss();
}
</script>

<dialog id="link-objectives-modal" bind:this={modal} class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">{$_("projects.objectivesForTitle", {values: {projectName}})}</h3>
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>{$_("common.name")}</th>
          <th>{$_("common.description")}</th>
          <th>{$_("common.linked")}</th>
        </tr>
      </thead>
      <tbody>
        {#each linkedObjectivesInitial as objective}
          <LinkedObjectiveRow objective={objective} isLinked={true} onIsLinkedChange={(isLinked) => onIsLinkedChanged(objective, isLinked)} />
        {/each}

        {#each unlinkedObjectivesInitial as objective}
          <LinkedObjectiveRow objective={objective} isLinked={false} onIsLinkedChange={(isLinked) => onIsLinkedChanged(objective, isLinked)} />
        {/each}
      </tbody>
    </table>
    <div class="modal-action">
      <form method="dialog" class="flex gap-3 w-full justify-end">
        <button class="btn" onclick={ondismiss}>{$_("common.cancel")}</button>
        <button class="btn btn-primary" onclick={onconfirm}>{$_("common.confirm")}</button>
      </form>
    </div>
  </div>
</dialog>
