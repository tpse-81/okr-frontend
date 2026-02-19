<!--
@component
- Generic dialog for linking/unlinking objectives.
- IMPORTANT: Keep original behavior:
  - The table shows two fixed "initial" lists (initially linked + initially unlinked).
  - Clicking does NOT remove rows from the table; it only toggles the linked state.
  - Actual API persistence is delegated via writeChanges and only happens on confirm.
-->
<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { getObjectives } from "$lib/api";
import type { Objective } from "$lib/types";
import LinkedObjectiveRow from "./LinkedObjectiveRow.svelte";

let {
	title,
	initialLinked,
	onLinkedChanged,
	writeChanges,
	show,
	ondismiss,

	excludeObjectiveIds = [],

	labels = {
		name: $_("common.name"),
		description: $_("common.description"),
		linked: $_("common.linked"),
		cancel: $_("common.cancel"),
		confirm: $_("common.confirm"),
	},

	showErrors = false,
}: {
	title: string;
	initialLinked: Objective[];
	onLinkedChanged: (objectives: Objective[]) => void;
	writeChanges: (
		toAdd: Objective[],
		toRemove: Objective[],
	) => Promise<string[]>;
	show: boolean;
	ondismiss: () => void;

	excludeObjectiveIds?: string[];

	labels?: {
		name: string;
		description: string;
		linked: string;
		cancel: string;
		confirm: string;
	};

	showErrors?: boolean;
} = $props();

let modal: HTMLDialogElement;

// all objectives loaded from API
let allObjectives: Objective[] = $state([]);

// "Initial" lists for THIS opening (these are rendered, and never change while open)
let renderLinkedInitial: Objective[] = $state([]);
let renderUnlinkedInitial: Objective[] = $state([]);

// Working state (changes on toggle, but table rows stay)
let workingLinked: Objective[] = $state([]);
let workingUnlinked: Objective[] = $state([]);

// Errors (only used when showErrors=true)
let errorMessages: string[] = $state([]);

$effect(() => {
	if (show) modal.showModal();
	else modal.close();
});

onMount(async () => {
	allObjectives = await getObjectives();
});

// Re-initialize dialog state every time it is opened
$effect(() => {
	if (!show) return;
	if (allObjectives.length === 0) return;

	const linkedInitialSnapshot = [...initialLinked];

	const unlinkedInitialSnapshot = allObjectives.filter(
		(obj) =>
			!excludeObjectiveIds.includes(obj.id) &&
			!linkedInitialSnapshot.some((l) => l.id === obj.id),
	);

	renderLinkedInitial = linkedInitialSnapshot;
	renderUnlinkedInitial = unlinkedInitialSnapshot;

	workingLinked = [...linkedInitialSnapshot];
	workingUnlinked = [...unlinkedInitialSnapshot];

	errorMessages = [];
});

function onIsLinkedChanged(objective: Objective, isLinked: boolean) {
	if (isLinked) {
		// now linked -> update working state
		workingUnlinked = workingUnlinked.filter((o) => o.id !== objective.id);
		if (!workingLinked.some((o) => o.id === objective.id)) {
			workingLinked = [...workingLinked, objective];
		}
	} else {
		// now unlinked -> update working state
		workingLinked = workingLinked.filter((o) => o.id !== objective.id);
		if (!workingUnlinked.some((o) => o.id === objective.id)) {
			workingUnlinked = [...workingUnlinked, objective];
		}
	}
}

function isCurrentlyLinked(id: string) {
	return workingLinked.some((o) => o.id === id);
}

async function onconfirm() {
	// Compute diffs exactly like the originals did:
	// toAdd = in workingLinked but not in initial linked
	// toRemove = in workingUnlinked but not in initial unlinked
	const toAdd = workingLinked.filter(
		(obj) => !renderLinkedInitial.some((l) => l.id === obj.id),
	);

	const toRemove = workingUnlinked.filter(
		(obj) => !renderUnlinkedInitial.some((u) => u.id === obj.id),
	);

	if (!showErrors) {
		await writeChanges(toAdd, toRemove);
		onLinkedChanged(workingLinked);
		ondismiss();
		return;
	}

	errorMessages = [];
	try {
		const errors = await writeChanges(toAdd, toRemove);
		if (errors.length > 0) {
			errorMessages = errors;
			return;
		}

		onLinkedChanged(workingLinked);
		ondismiss();
	} catch (err: any) {
		const detail = err?.detail ?? "Unknown error.";
		errorMessages = Array.isArray(detail) ? detail : [String(detail)];
	}
}
</script>

<dialog
	id="link-objectives-generic-modal"
	bind:this={modal}
	class="modal"
	onclose={ondismiss}
	oncancel={ondismiss}
>
	<div class="modal-box">
		<h3 class="text-lg font-bold">{title}</h3>

		{#if showErrors && errorMessages.length > 0}
			<div class="alert alert-error mt-3">
				<div>
					<div>{$_("objectives.linkingFailedError")}</div>
					<ul class="list-disc pl-5">
						{#each errorMessages as message}
							<li><pre class="whitespace-pre-wrap">{message}</pre></li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}

		<table class="table table-zebra w-full">
			<thead>
				<tr>
					<th>{labels.name}</th>
					<th>{labels.description}</th>
					<th>{labels.linked}</th>
				</tr>
			</thead>
			<tbody>
				{#each renderLinkedInitial as objective (objective.id)}
					<LinkedObjectiveRow
						objective={objective}
						isLinked={isCurrentlyLinked(objective.id)}
						onIsLinkedChange={(isLinked) =>
							onIsLinkedChanged(objective, isLinked)}
					/>
				{/each}

				{#each renderUnlinkedInitial as objective (objective.id)}
					<LinkedObjectiveRow
						objective={objective}
						isLinked={isCurrentlyLinked(objective.id)}
						onIsLinkedChange={(isLinked) =>
							onIsLinkedChanged(objective, isLinked)}
					/>
				{/each}
			</tbody>
		</table>

		<div class="modal-action">
			<form method="dialog" class="flex gap-3 w-full justify-end">
				<button type="button" class="btn" onclick={ondismiss}>
					{labels.cancel}
				</button>
				<button type="button" class="btn btn-primary" onclick={onconfirm}>
					{labels.confirm}
				</button>
			</form>
		</div>
	</div>
</dialog>