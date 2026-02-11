<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { createTaskKeyResult, getTasksKeyResult } from "$lib/api";
import type { Task, TaskState } from "$lib/types";
import TaskColumns from "../../../components/TaskColumns.svelte";

let { data } = $props();

let keyResultID = $derived(data.keyResultID);

let taskList: Task[] = $state([]);

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
	await createTaskKeyResult(keyResultID, description, taskState);

	taskList = await getTasksKeyResult(keyResultID);
}
</script>

<h1>Create a Task</h1>

<form id="task-submit" onsubmit={handleSubmit} class="flex gap-3 p-3">
    <input type="text" id="description" bind:value={description} placeholder="description" class="input w-full" required>
    <select bind:value={taskState} class="select select-bordered">
        <option value="open">open</option>
        <option value="planned">planned</option>
        <option value="in_progress">in_progress</option>
        <option value="done">done</option>
        <option value="cancelled">cancelled</option>
    </select>
    
    <input type="submit" value="Create" class="btn btn-primary">
</form>

<div class="p-3">
  <h1>Tasks</h1>
  <div id="tasks-list">
    <TaskColumns tasks={taskList} onTaskDeleted={id => taskList = taskList.filter(task => task.id != id)} />
  </div>
</div>
