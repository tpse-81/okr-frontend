<script lang="ts">
import { onMount } from "svelte";
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

<h1>Create a Task</h1>

<form id="task-submit" onsubmit={handleSubmit} class="grid grid-auto gap-3 p-3">
  <div class="form-control">
    <label for="task-name" class="label"><span class="label-text">Title</span></label>
    <input
      id="task-name"
      type="text"
      bind:value={name}
      placeholder="Title"
      class="input input-bordered w-full"
      required
    />
  </div>

  <div class="form-control md:col-span-2">
    <label for="task-description" class="label"><span class="label-text">Description</span></label>
    <textarea
      id="task-description"
      bind:value={description}
      placeholder="Description"
      class="textarea textarea-bordered w-full"
      rows="3"
    ></textarea>
  </div>

  <div class="form-control">
    <label for="task-state" class="label">
      <span class="label-text">State</span>
    </label>
    <select id="task-state" bind:value={taskState} class="select select-bordered">
      <option value="open">open</option>
      <option value="planned">planned</option>
      <option value="in_progress">in_progress</option>
      <option value="done">done</option>
      <option value="cancelled">cancelled</option>
    </select>
  </div>

  <div class="md:col-span-2 flex justify-end">
    <button type="submit" class="btn btn-primary">Create</button>
  </div>
</form>

<div class="p-3">
  <h1>Tasks</h1>
  <div id="tasks-list">
    <TaskColumns tasks={taskList} onTaskDeleted={id => taskList = taskList.filter(task => task.id != id)} />
  </div>
</div>
