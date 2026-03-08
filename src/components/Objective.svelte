<!--
@component
- Component for displaying objectives.
- Usage:
  ```html
  <Objective objective={objective}>
  ```
-->
<script lang="ts">
import { Archive, Edit, Trash } from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import { deleteObjective, getObjectivePermission } from "$lib/api";
import type { Objective } from "$lib/types";
import ConfirmationDialog from "./ConfirmationDialog.svelte";
import EditObjectiveComponent from "./EditObjectiveComponent.svelte";
import ExpandableDescription from "./ExpandableDescription.svelte";

let {
	objective,
	showEditActions = true,
	onObjectiveDeleted,
}: {
	objective: Objective;
	showEditActions?: boolean;
	onObjectiveDeleted?: () => void;
} = $props();

let showConfirmationDialog = $state(false);
let showEditDialog = $state(false);
let canEdit = $state(false);

onMount(async () => {
	try {
		const permissions = await getObjectivePermission(objective.id);
		canEdit = permissions.can_write; // user can edit
	} catch (err) {
		console.error("Failed to load project permissions", err);
	}
});

const isArchived = $derived(objective.is_archived === true);

async function onDeleteObjective() {
	showConfirmationDialog = false;

	if (await deleteObjective(objective.id)) onObjectiveDeleted?.();
}
</script>

<li class="min-w-0">
	<div
		class="card card-border relative cursor-pointer"
		role="link"
		tabindex="0"
		onclick={() => goto(`/objectives/${objective.id}`)}
		onkeydown={(e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				goto(`/objectives/${objective.id}`);
			}
		}}
	>
		{#if showEditActions}
			<div
				class="absolute right-2 top-2 flex gap-2"
				title={!canEdit ? $_("common.noPermissions") : ""}
			>
				<button
					class="btn btn-square"
					disabled={isArchived || !canEdit}
					onclick={(e) => {
						e.stopPropagation();
						canEdit && (showEditDialog = true);
					}}
				>
					<Edit size="16" />
				</button>
				<button
					class="btn btn-square"
					disabled={!canEdit}
					onclick={(e) => {
						e.stopPropagation();
						canEdit && (showConfirmationDialog = true);
					}}
				>
					<Trash size="16" />
				</button>
			</div>
		{/if}

		<div class="card-body pt-12">
			{#if isArchived}
				<div class="badge badge-warning">
					<Archive size="16" />
					{$_("common.archived")}
				</div>
			{/if}

			<h2 class="card-title">
				<span class="line-clamp-1 break-words"> {objective.name}</span>
			</h2>

			<ExpandableDescription text={objective.description} />
		</div>
	</div>
</li>

<EditObjectiveComponent
	show={showEditDialog}
	{objective}
	ondismiss={() => showEditDialog = false}
/>
<ConfirmationDialog
	show={showConfirmationDialog}
	message={$_("objectives.delete")}
	onconfirm={onDeleteObjective}
	ondismiss={() => showConfirmationDialog = false}
/>
