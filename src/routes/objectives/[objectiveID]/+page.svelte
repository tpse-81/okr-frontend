<script lang="ts">
import { ChevronDown, Edit, Trash } from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import {
	createKeyResult,
	deleteObjective,
	getKeyResultObjective,
	getObjectiveChildren,
	getObjectivePermission,
	getProjectsForObjective,
	linkObjectiveToObjective,
	unlinkObjectiveFromObjective,
} from "$lib/api";
import type { KeyResult, Objective, Project } from "$lib/types";
import ConfirmationDialog from "../../../components/ConfirmationDialog.svelte";
import EditObjectiveComponent from "../../../components/EditObjectiveComponent.svelte";
import ExpandableDescription from "../../../components/ExpandableDescription.svelte";
import KeyResultComponent from "../../../components/KeyResult.svelte";
import LinkObjectiveDialog from "../../../components/LinkObjectiveDialog.svelte";
import ObjectiveComponent from "../../../components/Objective.svelte";
import ProjectComponent from "../../../components/Project.svelte";
// biome-ignore lint/style/useImportType: Svelte component is needed at runtime
import SuccessDialog from "../../../components/SuccessDialog.svelte";

let successToast: SuccessDialog;
let { data } = $props();

// svelte-ignore state_referenced_locally
let objective = $state(data.objective);

let keyResultList: KeyResult[] = $state([]);
let relatedProjectsList: Project[] = $state([]);

let showLinkChildrenModal = $state(false);
let linkedChildren: Objective[] = $state([]);

let description: string = $state("");
let startValue: number = $state(0);
let endValue: number = $state(100);

let canCreate = $state(false);

let showEditDialog = $state(false);
let showConfirmationDialog = $state(false);

onMount(async () => {
	try {
		const permissions = await getObjectivePermission(objective.id);
		canCreate = permissions.can_write;
	} catch (err) {
		console.error(err);
	}
});

$effect(() => {
	// Always reload when the objective ID changes
	if (!objective.id) return;

	(async () => {
		try {
			await Promise.all([
				loadKeyResults(),
				loadChildren(),
				loadRelatedProjects(),
			]);
		} catch (err) {
			console.error(err);
		}
	})();
});

async function loadKeyResults() {
	try {
		keyResultList = await getKeyResultObjective(objective.id);
	} catch (err) {
		await goto("/expected");
	}
}

async function loadChildren() {
	try {
		linkedChildren = await getObjectiveChildren(objective.id);
	} catch (err) {
		console.error("Failed to load children", err);
		linkedChildren = [];
	}
}

async function loadRelatedProjects() {
	try {
		relatedProjectsList = await getProjectsForObjective(objective.id);
	} catch (err) {
		console.error(err);
	}
}

async function handleSubmit(e: SubmitEvent) {
	e.preventDefault();
	try {
		await createKeyResult(description, endValue, startValue, objective.id);
		successToast.displayMessage($_("keyResults.success"));
	} catch (err) {
		console.error(err);
	}
	keyResultList = await getKeyResultObjective(objective.id);
}

async function onDeleteObjective() {
	showConfirmationDialog = false;

	try {
		await deleteObjective(objective.id);
		await goto("/objectives");
	} catch (err) {
		console.error(err);
	}
}
</script>

<!-- Header -->
<div class="card bg-base-100 border border-base-300 m-3">
	<div class="card-body relatvie">
		<div class="absolute top-2 right-3 flex flex-col items-end gap-2 z-1">
			<span class="badge badge-primary">{$_("objectives.singular")}</span>
			<!-- Edit actions -->
			<div
				class="flex gap-2"
				title={!canCreate ? $_("common.noPermissions") : ""}
			>
				<button
					class="btn btn-square"
					disabled={!canCreate}
					onclick={() => canCreate && (showEditDialog = true)}
				>
					<Edit size="16" />
				</button>
				<button
					class="btn btn-square"
					disabled={!canCreate}
					onclick={() => canCreate && (showConfirmationDialog = true)}
				>
					<Trash size="16" />
				</button>
			</div>
		</div>
		<div class="flex items-center gap-4">
			<div class="min-w-0">
				<div class="text-2xl font-bold truncate max-w-full">
					{objective.name}
				</div>
				<ExpandableDescription text={objective.description} />
			</div>
		</div>
		<!-- Parent projects -->
		<details class="collapse bg-base-100 border border-base-300">
			<summary
				class="collapse-title font-semibold w-full flex justify-between items-center"
			>
				<span class="max-w-full truncate"
					>{$_("objectives.belongsToProjects")}</span
				>
				<ChevronDown size="24" />
			</summary>
			<div class="collapse-content text-sm">
				<ul id="related-projects-list" class="grid grid-auto gap-3">
					{#each relatedProjectsList as project}
						<ProjectComponent {project} showEditActions={false} />
					{/each}
				</ul>
			</div>
		</details>
	</div>
</div>

{#if canCreate}
	<div class="card bg-base-100 border border-base-300 m-3">
		<h1 class="ml-4 mt-1 truncate max-w-full">
			{$_("keyResults.createTitle")}
		</h1>

		<form
			id="keyResultSubmit"
			onsubmit={handleSubmit}
			class="flex flex-col lg:flex-row gap-3 p-3 items-end"
		>
			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">{$_("common.description")}</span>
				</div>
				<input
					type="text"
					id="description"
					bind:value={description}
					placeholder={$_("common.description")}
					class="input w-full"
					required
				>
			</label>

			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">{$_("keyResults.start")}</span>
				</div>
				<input
					type="number"
					step="any"
					id="start-value"
					bind:value={startValue}
					placeholder={$_("keyResults.start")}
					class="input w-full"
					required
				>
			</label>

			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">{$_("keyResults.target")}</span>
				</div>
				<input
					type="number"
					step="any"
					id="end-value"
					bind:value={endValue}
					placeholder={$_("keyResults.target")}
					class="input w-full"
					required
				>
			</label>

			<input type="submit" value={$_("common.create")} class="btn btn-primary">
		</form>
	</div>
{/if}

<div class="m-3">
	<h1 class="truncate max-w-full">{$_("keyResults.title")}</h1>
	{#if keyResultList.length > 0}
		<ul id="key-results-list" class="grid grid-auto gap-3">
			{#each keyResultList as keyResult}
				<KeyResultComponent
					{keyResult}
					onKeyResultDeleted={() => keyResultList = keyResultList.filter(kr => kr.id != keyResult.id)}
				/>
			{/each}
		</ul>
	{:else}
		<p>{$_("keyResults.empty")}</p>
	{/if}
</div>

{#if canCreate}
	<div class="p-3">
		<div class="card bg-base-100 border border-base-300">
			<div class="card-body gap-4">
				<div class="flex items-start gap-3">
					<h2 class="card-title flex-1">{$_("objectives.child")}</h2>
					<button
						class="btn btn-primary"
						onclick={() => showLinkChildrenModal = true}
					>
						{$_("objectives.addChild")}
					</button>
				</div>

				{#if linkedChildren.length > 0}
					<ul id="objectives-list" class="grid grid-auto">
						{#each linkedChildren as objective}
							<ObjectiveComponent
								{objective}
								onObjectiveDeleted={() => linkedChildren = linkedChildren.filter(obj => objective.id != obj.id)}
							/>
						{/each}
					</ul>
				{:else}
					<p class="opacity-70">{$_("objectives.emptyChild")}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<LinkObjectiveDialog
	title={$_("objectives.childrenForTitle", { values: { objectiveName: objective.name } })}
	initialLinked={linkedChildren}
	excludeObjectiveIds={[objective.id]}
	showErrors={true}
	writeChanges={async (toAdd, toRemove) => { 
   const addJobs = toAdd.map((obj) => ({
     obj,
     promise: linkObjectiveToObjective(objective.id, obj.id),
   }));

   const removeJobs = toRemove.map((obj) => ({
     obj,
     promise: unlinkObjectiveFromObjective(objective.id, obj.id),
   }));

   const jobs = [...addJobs, ...removeJobs];
   const results = await Promise.allSettled(jobs.map((j) => j.promise));

   const errors: string[] = [];

   for (let i = 0; i < results.length; i++) {
     const r = results[i];
     if (r.status === "rejected") {
       const job = jobs[i];
       const status = (r.reason as any)?.status;
       const raw =
         (r.reason as any)?.detail ??
         (r.reason instanceof Error ? r.reason.message : undefined) ??
         "Request failed";

       const detail =
         status === 400
           ? $_("objectives.cycleError")
           : status === 404
             ? $_("objectives.notFoundError")
             : raw === "Bad Request"
               ? $_("objectives.cycleError")
               : raw;

       errors.push(`${job.obj.name}: ${detail}`);
     }
   }

   return errors;
 }}
	onLinkedChanged={(children) => (linkedChildren = children)}
	ondismiss={() => (showLinkChildrenModal = false)}
	show={showLinkChildrenModal}
/>

<EditObjectiveComponent
	show={showEditDialog}
	{objective}
	ondismiss={() => (showEditDialog = false)}
/>

<ConfirmationDialog
	show={showConfirmationDialog}
	message={$_("objectives.delete")}
	onconfirm={onDeleteObjective}
	ondismiss={() => (showConfirmationDialog = false)}
/>

<SuccessDialog bind:this={successToast}></SuccessDialog>
