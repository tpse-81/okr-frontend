<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { Archive, Check } from "@lucide/svelte";
import { getArchivedTasks, getTasks } from "$lib/api";
import type { Task } from "$lib/types";
import TaskColumns from "../../components/TaskColumns.svelte";

let tasklist: Task[] = $state([]);

let activeMultiFilters = $state<string[]>([]);

const multiOptions = [
	{
		value: "archived",
		icon: Archive,
		size: 26,
		tooltip: "Show archived tasks",
	},
];

function applyMultiFilter(value: string) {
	if (activeMultiFilters.includes(value)) {
		activeMultiFilters = activeMultiFilters.filter((v) => v !== value);
	} else {
		activeMultiFilters = [...activeMultiFilters, value];
	}
}

let visibleTasks = $derived.by(() => {
	if (activeMultiFilters.includes("archived")) {
		return tasklist.filter((t) => t.is_archived === true);
	}
	return tasklist.filter((t) => t.is_archived !== true);
});

onMount(async () => {
	try {
		await tasks();
	} catch (err) {
		console.error(err);
	}
});

async function tasks() {
	try {
		const [all, archived] = await Promise.all([
			getTasks() as Promise<Task[]>,
			getArchivedTasks() as Promise<Task[]>,
		]);

		const archivedIds = new Set(archived.map((t) => t.id));

		tasklist = all.map((t) => ({
			...t,
			is_archived: archivedIds.has(t.id),
		}));
	} catch (err) {
		await goto("/expected");
	}
}
</script>

<div class="p-3">
	<div class="flex justify-between items-center mb-5 gap-5">
		<h1 class="text-3xl flex-1">Tasks</h1>

		<div class="join shrink-0">
			{#each multiOptions as option}
				<div class="tooltip tooltip-left" data-tip="{option.tooltip}">
					<button
						class="btn join-item transition-transform duration-150
						{activeMultiFilters.includes(option.value) ? 'btn-active scale-110' : ''}"
						onclick={() => applyMultiFilter(option.value)}
					>
						<option.icon size={option.size} />
						{#if activeMultiFilters.includes(option.value)}
							<Check class="w-4 h-4 ml-1 inline-block" />
						{/if}
					</button>
				</div>
			{/each}
		</div>
	</div>

	<TaskColumns tasks={visibleTasks} onTaskDeleted={(id) => { tasklist = tasklist.filter((t) => t.id !== id); }} />
</div>
