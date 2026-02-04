<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { getTasks } from "$lib/api";
import type { Task } from "$lib/types";
import TaskColumns from "../../components/TaskColumns.svelte";

let tasklist: Task[] = $state([]);

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
</script>

<div class="p-3">
	<h1>Tasks</h1>
	<TaskColumns tasks={tasklist} onTaskDeleted={id => tasklist = tasklist.filter(task => task.id != id)} />
</div>
