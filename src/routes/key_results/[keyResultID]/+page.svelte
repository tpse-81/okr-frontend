<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { createTaskKeyResult, getTasksKeyResult } from "$lib/api";
import type { Task, TaskState } from "$lib/types";
import TaskComponent from "../../../components/Task.svelte";

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

async function handleSubmit() {
	await createTaskKeyResult(keyResultID, description, taskState);

	taskList = await getTasksKeyResult(keyResultID);
}
</script>

<h1>Create a Task</h1>

<form id="keyResultSubmit" onsubmit={handleSubmit} class="flex gap-3 p-3">
    <input type="text" bind:value={description} placeholder="description" class="input w-full">
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
    {#if taskList.length > 0}
        <ul class="grid grid-auto gap-3">
            {#each taskList as task}
            		<TaskComponent task={task} />
            {/each}
        </ul>
    {:else}
        <p>No Tasks loaded</p>
    {/if}
</div>
