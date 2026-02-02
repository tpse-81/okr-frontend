<script lang="ts">
import type { Task } from "$lib/types";
import TaskComponent from "./Task.svelte";

let { tasks }: { tasks: Task[] } = $props();

let tasksGroupedByState = $derived(
	Object.groupBy(tasks, (task) => task.task_state),
);
</script>

{#if Object.keys(tasksGroupedByState).length > 0}
	<div class="grid grid-auto gap-3">
		{#each Object.entries(tasksGroupedByState) as [state, tasks]}
			<div class="flex w-full py-3">
				<div class="w-full">
					<h2 class="title text-bold text-accent-content">{ state }</h2>
			    <ul class="flex flex-col gap-3">
			        {#each tasks as task}
			        	<TaskComponent task={task} />
			        {/each}
			    </ul>
		    </div>
		    <div class="divider divider-neutral divider-horizontal"></div>
	    </div>
    {/each}
  </div>
{:else}
    <p>No Tasks loaded</p>
{/if}
