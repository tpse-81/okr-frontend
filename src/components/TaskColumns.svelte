<script lang="ts">
import { _ } from "svelte-i18n";
import type { Task } from "$lib/types";
import TaskComponent from "./Task.svelte";

let {
	tasks,
	onTaskDeleted,
}: { tasks: Task[]; onTaskDeleted: (id: string) => void } = $props();

let tasksGroupedByState = $derived(
	Object.groupBy(tasks, (task) => task.task_state),
);
</script>

{#if Object.keys(tasksGroupedByState).length > 0}
	<div class="grid grid-auto gap-3">
		{#each Object.entries(tasksGroupedByState) as [state, tasks]}
			<div class="flex w-full py-3">
				<div class="w-full">
					<h2 class="title text-bold text-accent-content">{ $_(`tasks.${state}`) }</h2>
			    <ul class="flex flex-col gap-3">
			        {#each tasks as task}
			        	<TaskComponent task={task} onTaskDeleted={() => onTaskDeleted(task.id)} />
			        {/each}
			    </ul>
		    </div>
		    <div class="divider divider-neutral divider-horizontal"></div>
	    </div>
    {/each}
  </div>
{:else}
    <p>{$_("tasks.empty")}</p>
{/if}
