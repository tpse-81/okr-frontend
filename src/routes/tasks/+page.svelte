<script lang="ts">
import { getTasksKeyResult, createTaskKeyResult } from "$lib/api";
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import type { Task, TaskState } from "$lib/types";

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
		tasklist = await getTasksKeyResult(keyResultID);
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
	{#if tasklist.length > 0}
	    <ul class="grid grid-auto gap-3">
	        {#each tasklist as task}
	            <li class="card card-border">
	                <a href={`/objectives/${task.id}`} class="card-body">
	                    Name: <strong>{task.description}</strong><br>
	                    Description: {task.description}<br>
                        State: {task.task_state}<br>
	                    <small>(ID: {task.id})</small><br><br>
	                </a>
	            </li>
	        {/each}
	    </ul>
	{:else}
	    <p>No Tasks loaded</p>
	{/if}
</div>