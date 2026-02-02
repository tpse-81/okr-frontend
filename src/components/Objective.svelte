<!--
@component
- Component for displaying objectives.
- Usage:
  ```html
  <Objective objective={objective}>
  ```
-->
<script lang="ts">
import { Trash } from "@lucide/svelte";
import { deleteObjective } from "$lib/api";
import type { Objective } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";

let {
	objective,
	onObjectiveDeleted,
}: { objective: Objective; onObjectiveDeleted: () => void } = $props();

let showConfirmationDialog = $state(false);

async function onDeleteObjective() {
	showConfirmationDialog = false;

	if (await deleteObjective(objective.id)) onObjectiveDeleted();
}
</script>

<li class="card card-border relative">
    <button class="btn btn-square absolute right-2 top-2" onclick={() => showConfirmationDialog = true}><Trash size="16" /></button>
    <a href={`/objectives/${objective.id}`} class="card-body">
        <h2 class="card-title">{objective.name}</h2>
        <p>{objective.description}</p>
    </a>
</li>

<ConfirmationDialog show={showConfirmationDialog} message="Delete objective" onconfirm={onDeleteObjective} ondismiss={() => showConfirmationDialog = false} />
