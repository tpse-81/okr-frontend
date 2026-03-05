<script lang="ts">
import { ChevronDown } from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import {
	createTaskKeyResult,
	getKeyResultPermission,
	getObjectiveForKeyResult,
	getTasksKeyResult,
} from "$lib/api";
import {
	type Objective,
	type Task,
	type TaskState,
	taskStates,
} from "$lib/types";
import ObjectiveComponent from "../../../components/Objective.svelte";
import TaskColumns from "../../../components/TaskColumns.svelte";
import SuccessDialog from "../../../components/SuccessDialog.svelte";

let SuccessMessage: string | null = $state(null);

let { data } = $props();

let keyResultID = $derived(data.keyResultID);

let taskList: Task[] = $state([]);
let relatedObjective: Objective | null = $state(null);

let name: string = $state("");
let description: string = $state("");
let taskState: TaskState = $state("open");

let canCreate = $state(false);

onMount(async () => {
	try {
		await Promise.all([loadTasks(), loadRelatedObjective()]);
		const permissions = await getKeyResultPermission(keyResultID);
		canCreate = permissions.can_write;
	} catch (err) {
		console.error(err);
	}
});

async function loadTasks() {
	try {
		taskList = await getTasksKeyResult(keyResultID);
	} catch (err) {
		await goto("/expected");
	}
}

async function loadRelatedObjective() {
	try {
		relatedObjective = await getObjectiveForKeyResult(keyResultID);
	} catch (err) {
		console.error(err);
	}
}

async function handleSubmit(e: SubmitEvent) {
	e.preventDefault();
	try {
		await createTaskKeyResult(keyResultID, name, description, taskState);
		SuccessMessage = null;
		await tick();
		SuccessMessage = $_("tasks.success");
	} catch (err) {
		console.error(err);
	}
	await loadTasks();
	name = "";
	description = "";
}
</script>

{#if canCreate}
	<div class="card bg-base-100 border border-base-300">
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
					/>
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
    <TaskColumns tasks={taskList} onTaskDeleted={id => taskList = taskList.filter(task => task.id != id)} />
  </div>
</div>

<div class="m-3">
	<details class="collapse bg-base-100 border border-base-300 m-3">
	  <summary class="collapse-title font-semibold w-full flex justify-between items-center">
	  	<span class="truncate max-w-full">{$_("keyResults.belongsToObjective", { values: {keyResultDescription: data.keyResultDescription} })}</span>
	  	<ChevronDown size="24" />
	  </summary>
	  <div class="collapse-content text-sm">
			<ul id="related-objectives-list" class="grid grid-auto">
					{#if relatedObjective}
						<ObjectiveComponent objective={relatedObjective} showEditActions={false} />
					{/if}
			</ul>
	  </div>
	</details>
</div>

<SuccessDialog message={SuccessMessage}></SuccessDialog>
