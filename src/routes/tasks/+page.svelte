<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { createTaskKeyResult, getTasks } from "$lib/api";
import type { Task, TaskState } from "$lib/types";
import TaskColumns from "../../components/TaskColumns.svelte";

let tasklist: Task[] = $state([]);
let description: string = $state("");
let taskState: TaskState = $state("open");
let keyResultID: string = $state("");

onMount(async () => {
	try {
		await tasks();
	} catch (err) {
		console.error(err);
	}
});

async function tasks() {
	try {
		tasklist = await getTasks();
	} catch (err) {
		await goto("/expected");
	}
}

async function createTask() {
	await createTaskKeyResult(keyResultID, description, taskState);
}
</script>

<h1>Create a Task</h1>

<form id="objective-submit" onsubmit={createTask} class="flex gap-3 p-3">
    <input type="text" bind:value={description} placeholder="Description" class="input w-full">
    <input type="text" bind:value={keyResultID} placeholder="key result id" class="input w-full">
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
</div>

<TaskColumns tasks={tasklist} onTaskDeleted={id => tasklist = tasklist.filter(task => task.id != id)} />
