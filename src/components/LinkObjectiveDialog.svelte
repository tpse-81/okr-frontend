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

	labels: labelsProp = undefined,

	showErrors = false,
}: {
	title: string;
	initialLinked: Objective[];
	onLinkedChanged: (objectives: Objective[]) => void;
	writeChanges: (
		toAdd: Objective[],
		toRemove: Objective[],
		confirmOrphan?: boolean,
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

let labels = $state({
	name: "",
	description: "",
	linked: "",
	cancel: "",
	confirm: "",
});

$effect(() => {
	// if parent passed labels, use them
	if (labelsProp) {
		labels = labelsProp;
		return;
	}

	// otherwise use i18n defaults (this reruns on language switch)
	labels = {
		name: $_("common.name"),
		description: $_("common.description"),
		linked: $_("common.linked"),
		cancel: $_("common.cancel"),
		confirm: $_("common.confirm"),
	};
});

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

let showOrphanConfirm = $state(false);
let orphanConfirmIds: string[] = $state([]);
let pendingToAdd: Objective[] = $state([]);
let pendingToRemove: Objective[] = $state([]);
let orphanObjectives: Objective[] = $state([]);

async function acceptOrphanConfirm() {
	showOrphanConfirm = false;

	try {
		// retry with confirmOrphan=true
		await writeChanges(pendingToAdd, pendingToRemove, true);
		onLinkedChanged(workingLinked);
		ondismiss();
	} catch {
		// minimal: don't close, don't overwrite state
	} finally {
		// cleanup
		orphanConfirmIds = [];
		pendingToAdd = [];
		pendingToRemove = [];
		orphanObjectives = [];
	}
}

function cancelOrphanConfirm() {
	showOrphanConfirm = false;

	// set checks correctly again
	relinkObjectivesById(orphanConfirmIds);

	// cleanup
	orphanConfirmIds = [];
	pendingToAdd = [];
	pendingToRemove = [];
	orphanObjectives = [];
}

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

	showOrphanConfirm = false;
	orphanConfirmIds = [];
	pendingToAdd = [];
	pendingToRemove = [];
	orphanObjectives = [];
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

/**
 * Reverts unlink operations for the given objective IDs
 *
 * This is needed when the user tries to unlink an objective from its last project and then cancels the confirmation.
 * In that case, we must restore the working state so the objectives appear linked again (checkbox checked) inside the still-open dialog.
 */
function relinkObjectivesById(ids: string[]) {
	for (const id of ids) {
		const obj = workingUnlinked.find((o) => o.id === id);
		if (!obj) continue;

		workingUnlinked = workingUnlinked.filter((o) => o.id !== id);

		if (!workingLinked.some((o) => o.id === id)) {
			workingLinked = [...workingLinked, obj];
		}
	}
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
		try {
			await writeChanges(toAdd, toRemove);
		} catch (err: any) {
			if (err?.message === "ORPHAN_CONFIRM_NEEDED") {
				orphanConfirmIds = err.orphanObjectiveIds;
				orphanObjectives = err.orphanObjectives ?? [];

				// Save diffs for retry if user accepts
				pendingToAdd = toAdd;
				pendingToRemove = toRemove;

				showOrphanConfirm = true;
				return;
			}

			if (
				err?.message === "ORPHAN_UNLINK_CANCELLED" &&
				Array.isArray(err?.orphanObjectiveIds)
			) {
				relinkObjectivesById(err.orphanObjectiveIds);
				return;
			}

			return;
		}

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
		<h3 class="text-lg font-bold truncate max-w-xl">{title}</h3>

		{#if showOrphanConfirm}
			<div class="alert alert-warning mt-4">
				<div class="max-w-full overflow-hidden">
					<span class="font-bold">{$_("common.warning")}</span>
					<p class="mt-2">{$_("projects.orphanConfirm")}</p>

					<ul class="list-disc pl-5 mt-2 max-w-full">
						{#each orphanObjectives as objective (objective.id)}
							<li>
								<span class="truncate">{objective.name ?? objective.id}</span>
							</li>
						{/each}
					</ul>

					<p class="mt-2">{$_("common.continueQuestion")}</p>

					<div class="flex gap-2 mt-4 justify-end">
						<button
							type="button"
							class="btn btn-sm"
							onclick={cancelOrphanConfirm}
						>
							{labels.cancel}
						</button>
						<button
							type="button"
							class="btn btn-sm btn-primary"
							onclick={acceptOrphanConfirm}
						>
							{labels.confirm}
						</button>
					</div>
				</div>
			</div>
		{/if}

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

		<table class="table table-zebra w-full table-fixed">
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
						{objective}
						isLinked={isCurrentlyLinked(objective.id)}
						onIsLinkedChange={(isLinked) =>
							onIsLinkedChanged(objective, isLinked)}
					/>
				{/each}

				{#each renderUnlinkedInitial as objective (objective.id)}
					<LinkedObjectiveRow
						{objective}
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
