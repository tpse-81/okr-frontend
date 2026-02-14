<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { Archive, Check } from "@lucide/svelte";
import { getTasks, getArchivedObjectives, getObjectives, getKeyResultObjective, getTasksKeyResult, } from "$lib/api";
import type { KeyResult, Objective, Task } from "$lib/types";
import TaskColumns from "../../components/TaskColumns.svelte";

let tasklist: Task[] = $state([]);
let archivedTaskIds: string[] = $state([]);

let activeMultiFilters = $state<string[]>([]);

const multiOptions = [
	{
		value: "archived",
		icon: Archive,
		size: 26,
		filter: (list: Task[]) => {
			const archivedIds = new Set(archivedTaskIds);
			return list.filter((t) => archivedIds.has(t.id));
		},
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
	let list = tasklist;
	const archivedIds = new Set(archivedTaskIds);

	if (activeMultiFilters.includes("archived")) {
		list = list.filter((t) => archivedIds.has(t.id));
	} else {
		list = list.filter((t) => !archivedIds.has(t.id));
	}

	return list;
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
		const [objectives, archivedObjectives] = await Promise.all([
			getObjectives() as Promise<Objective[]>,
			getArchivedObjectives() as Promise<Objective[]>,
		]);

		const archivedObjectiveIds = new Set(archivedObjectives.map((o) => o.id));

		const krByObjective = await Promise.all(
			objectives.map(async (obj) => ({
				objectiveId: obj.id,
				keyResults: (await getKeyResultObjective(obj.id)) as KeyResult[],
			})),
		);

		const taskJobs = krByObjective.flatMap(({ objectiveId, keyResults }) =>
			keyResults.map(async (kr) => ({
				objectiveId,
				keyResultId: kr.id,
				tasks: (await getTasksKeyResult(kr.id)) as Task[],
			})),
		);

		const results = await Promise.all(taskJobs);

		const allTasks: Task[] = [];
		const archivedTasks: string[] = [];

		for (const row of results) {
			for (const t of row.tasks) {
				const withKr = { ...t, key_result_id: row.keyResultId } as Task;
				allTasks.push(withKr);

				if (archivedObjectiveIds.has(row.objectiveId)) {
					archivedTasks.push(t.id);
				}
			}
		}

		tasklist = allTasks;
		archivedTaskIds = archivedTasks;
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

	<TaskColumns tasks={visibleTasks} onTaskDeleted={(id) => { tasklist = tasklist.filter((t) => t.id !== id); archivedTaskIds = archivedTaskIds.filter((x) => x !== id); }} />
</div>
