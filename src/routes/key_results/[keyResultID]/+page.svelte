<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import { createTaskKeyResult, getTasksKeyResult } from "$lib/api";
import type { Task, TaskState } from "$lib/types";
import TaskColumns from "../../../components/TaskColumns.svelte";

let { data } = $props();

let keyResultID = $derived(data.keyResultID);

let taskList: Task[] = $state([]);
let name: string = $state("");
let description: string = $state("");
let taskState: TaskState = $state("open");

onMount(async () => {
	try {
		await loadTasks();
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

async function handleSubmit(e: SubmitEvent) {
	e.preventDefault();
	await createTaskKeyResult(keyResultID, name, description, taskState);

	await loadTasks();
	name = "";
	description = "";
}
</script>

<div class="card card-border m-3">
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
						<option value="open">{$_("tasks.open")}</option>
						<option value="planned">{$_("tasks.planned")}</option>
						<option value="in_progress">{$_("tasks.in_progress")}</option>
						<option value="done">{$_("tasks.done")}</option>
						<option value="cancelled">{$_("tasks.cancelled")}</option>
					</select>

					<button type="submit" class="btn btn-primary">
						{$_("common.create")}
					</button>
				</div>
			</div>
		</div>
	</form>
</div>

<div class="p-3">
  <h1>{$_("tasks.title")}</h1>
  <div id="tasks-list">
    <TaskColumns tasks={taskList} onTaskDeleted={id => taskList = taskList.filter(task => task.id != id)} />
  </div>
</div>
