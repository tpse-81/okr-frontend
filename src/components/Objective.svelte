<!--
@component
- Component for displaying objectives.
- Usage:
  ```html
  <Objective objective={objective}>
  ```
-->
<script lang="ts">
import { Edit, Trash } from "@lucide/svelte";
import { _ } from "svelte-i18n";
import { deleteObjective } from "$lib/api";
import type { Objective } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditObjectiveComponent from "./EditObjectiveComponent.svelte";

let {
	objective,
	onObjectiveDeleted,
}: { objective: Objective; onObjectiveDeleted: () => void } = $props();

let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);

async function onDeleteObjective() {
	showConfirmationDialog = false;

	if (await deleteObjective(objective.id)) onObjectiveDeleted();
}
</script>

<li class="card card-border relative">
  	<div class="absolute right-2 top-2 flex gap-2">
		  <button class="btn btn-square" onclick={() => showEditDialog = true}><Edit size="16" /></button>
		  <button class="btn btn-square" onclick={() => showConfirmationDialog = true}><Trash size="16" /></button>
		</div>
    <a href={`/objectives/${objective.id}`} class="card-body">
        <h2 class="card-title">{objective.name}</h2>
        <p>{objective.description}</p>
    </a>
</li>

<EditObjectiveComponent show={showEditDialog} objective={objective} ondismiss={() => showEditDialog = false} />
<ConfirmationDialog show={showConfirmationDialog} message={$_("objectives.delete")} onconfirm={onDeleteObjective} ondismiss={() => showConfirmationDialog = false} />
