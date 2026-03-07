<script lang="ts">
import { ChevronDown, Edit, Trash } from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import {
	createTaskKeyResult,
	deleteKeyResult,
	getKeyResultPermission,
	getObjectiveForKeyResult,
	getTasksKeyResult,
} from "$lib/api";
import {
	type KeyResult,
	type Objective,
	type Task,
	type TaskState,
	taskStates,
} from "$lib/types";
import ConfirmationDialog from "../../../components/ConfirmationDialog.svelte";
import EditKeyResultComponent from "../../../components/EditKeyResultComponent.svelte";
import ExpandableDescription from "../../../components/ExpandableDescription.svelte";
import KeyResultProgress from "../../../components/KeyResultProgress.svelte";
import ObjectiveComponent from "../../../components/Objective.svelte";
// biome-ignore lint/style/useImportType: Svelte component is needed at runtime
import SuccessDialog from "../../../components/SuccessDialog.svelte";
import TaskColumns from "../../../components/TaskColumns.svelte";

let successToast: SuccessDialog;

let { data } = $props();

// svelte-ignore state_referenced_locally
let keyResult: KeyResult = $state(data.keyResult);

let taskList: Task[] = $state([]);
let relatedObjective: Objective | null = $state(null);

let name: string = $state("");
let description: string = $state("");
let taskState: TaskState = $state("open");

let canCreate = $state(false);

let showEditDialog = $state(false);
let showConfirmationDialog = $state(false);

onMount(async () => {
	try {
		await Promise.all([loadTasks(), loadRelatedObjective()]);
		const permissions = await getKeyResultPermission(keyResult.id);
		canCreate = permissions.can_write;
	} catch (err) {
		console.error(err);
	}
});

async function loadTasks() {
	try {
		taskList = await getTasksKeyResult(keyResult.id);
	} catch (err) {
		await goto("/expected");
	}
}

async function loadRelatedObjective() {
	try {
		relatedObjective = await getObjectiveForKeyResult(keyResult.id);
	} catch (err) {
		console.error(err);
	}
}

async function handleSubmit(e: SubmitEvent) {
	e.preventDefault();
	try {
		await createTaskKeyResult(keyResult.id, name, description, taskState);
		successToast.displayMessage($_("tasks.success"));
	} catch (err) {
		console.error(err);
	}
	await loadTasks();
	name = "";
	description = "";
}

async function onDeleteKeyResult() {
	showConfirmationDialog = false;

	try {
		await deleteKeyResult(keyResult.id);
		await goto(`/objectives/${keyResult.objective_id}`);
	} catch (err) {
		console.error(err);
	}
}
</script>

<!-- Header -->
<div class="card bg-base-100 border border-base-300 m-3">
	<div class="card-body relatvie">
		<div class="absolute top-2 right-3 flex flex-col items-end gap-2">
			<span class="badge badge-primary">{$_("keyResults.singular")}</span>

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
		<div class="flex gap-6 items-center my-3">
			<KeyResultProgress {keyResult} />
			<div>
				<ExpandableDescription text={keyResult.description} bigText={true} />
				<div>
					<p>{$_("keyResults.start")}: {keyResult.start_value}</p>
					<p>{$_("keyResults.current")}: {keyResult.current_value}</p>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-4">
			<details class="collapse bg-base-100 border border-base-300 w-full">
				<summary
					class="collapse-title font-semibold w-full flex justify-between items-center"
				>
					<span class="truncate max-w-full"
						>{$_("keyResults.belongsToObjective")}</span
					>
					<ChevronDown size="24" />
				</summary>
				<div class="collapse-content text-sm">
					<ul id="related-objectives-list" class="grid grid-auto">
						{#if relatedObjective}
							<ObjectiveComponent
								objective={relatedObjective}
								showEditActions={false}
							/>
						{/if}
					</ul>
				</div>
			</details>
		</div>
	</div>
</div>

{#if canCreate}
	<div class="card bg-base-100 border border-base-300 m-3">
		<div class="px-3 pt-3 card-title">{$_("tasks.createTitle")}</div>

		<form
			id="task-submit"
			onsubmit={handleSubmit}
			class="grid grid-cols-1 gap-3 card-body md:grid-cols-[1fr_auto] md:items-end"
		>
			<!-- Left column: title + description + status stacked -->
			<div class="flex flex-col gap-3">
				<div class="form-control">
					<label for="task-name" class="label">
						<span class="label-text">{$_("tasks.name")}</span>
					</label>
					<input
						id="task-name"
						type="text"
						bind:value={name}
						placeholder={$_("tasks.name")}
						class="input input-bordered w-full"
						required
					>
				</div>

				<div class="form-control">
					<label for="task-description" class="label">
						<span class="label-text">{$_("common.description")}</span>
					</label>
					<textarea
						id="task-description"
						bind:value={description}
						placeholder={$_("common.description")}
						class="textarea textarea-bordered w-full"
						rows="3"
						required
					></textarea>
				</div>

				<div class="form-control">
					<label for="task-state" class="label">
						<span class="label-text">{$_("tasks.state")}</span>
					</label>
					<div class="flex gap-3">
						<select
							id="task-state"
							bind:value={taskState}
							class="select select-bordered w-full"
						>
							{#each taskStates as state}
								<option value={state.state}>{$_(state.label)}</option>
							{/each}
						</select>

						<button type="submit" class="btn btn-primary">
							{$_("common.create")}
						</button>
					</div>
				</div>
			</div>
		</form>
	</div>
{/if}

<div class="p-3">
	<h1>{$_("tasks.title")}</h1>
	<div id="tasks-list">
		<TaskColumns
			tasks={taskList}
			onTaskDeleted={id => taskList = taskList.filter(task => task.id != id)}
		/>
	</div>
</div>

<EditKeyResultComponent
	show={showEditDialog}
	{keyResult}
	ondismiss={() => (showEditDialog = false)}
/>

<ConfirmationDialog
	show={showConfirmationDialog}
	message={$_("keyResults.delete")}
	onconfirm={onDeleteKeyResult}
	ondismiss={() => (showConfirmationDialog = false)}
/>

<SuccessDialog bind:this={successToast}></SuccessDialog>
