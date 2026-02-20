<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { getArchivedObjectives, getArchivedProjects, getDashboard, getKeyResultObjective, getTasksKeyResult } from "$lib/api";
import type { Objective, Project, ProjectContainer, KeyResult, Task } from "$lib/types";
import DashboardDeadlineComponent from "../../components/DashboardDeadline.svelte";
import DashboardProjectComponent from "../../components/DashboardProject.svelte";
import DashboardTaskComponent from "../../components/DashboardTask.svelte";

let projectContainers: ProjectContainer[] = $state([]);
let projectsList: Project[] = $state([]);
let closestDeadlineProjects: Project[] = $state([]);
let taskList: Task[] = $state([]);

onMount(async () => {
	try {
		await loadDashboard();
	} catch (err) {
		console.error(err);
	}
});

async function loadDashboard() {
	try {
		const [rawDashboard, archivedProjects, archivedObjectives] = await Promise.all([
			getDashboard() as Promise<ProjectContainer[]>,
			getArchivedProjects() as Promise<Project[]>,
			getArchivedObjectives() as Promise<Objective[]>,
		]);

		const archivedProjectIds = new Set(archivedProjects.map((p) => p.id));
		const archivedObjectiveIds = new Set(archivedObjectives.map((o) => o.id));

		const filteredContainers = rawDashboard
			.filter((pc) => !archivedProjectIds.has(pc.project.id))
			.map((pc) => ({
				...pc,
				objectives: pc.objectives.filter(
					(obj) => !archivedObjectiveIds.has(obj.id) && obj.is_archived !== true,
				),
				project: {
					...pc.project,
					creation_date: new Date(pc.project.creation_date),
					deadline: new Date(pc.project.deadline),
				},
			}));

		projectContainers = filteredContainers;

		projectsList = filteredContainers.map((pc) => pc.project);

		const visibleObjectiveIds = Array.from(
			new Set(filteredContainers.flatMap((pc) => pc.objectives.map((o) => o.id))),
		);

		taskList = await loadTasksForObjectives(visibleObjectiveIds);
	} catch (err) {
		await goto("/expected");
	}
}

async function loadTasksForObjectives(objectiveIds: string[]): Promise<Task[]> {
	const krLists = await Promise.all(
		objectiveIds.map(async (oid) => (await getKeyResultObjective(oid)) as KeyResult[]),
	);
	const keyResults = krLists.flat();
	const keyResultIds = keyResults.map((kr) => kr.id);

	const taskLists = await Promise.all(
		keyResultIds.map(async (krid) => {
			const tasks = (await getTasksKeyResult(krid)) as Task[];
			return tasks.map((t) => ({ ...t, key_result_id: krid } as Task));
		}),
	);

	return taskLists.flat();
}

$effect(() => {
	closestDeadlineProjects = [...projectsList]
		.sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
		.slice(0, 5);
});
</script>

<h1 class="ml-15">Hallo Dashboard</h1>

<div class="flex gap-4 ml-15">
	<div class="flex-1">
		<div class="card card-border relative">
			<div class="p-3">
				<h1>Projects</h1>
				{#if projectContainers.length > 0}
					<ul class="flex -gap-10 overflow-x-auto pb-2">
						{#each projectContainers as projectContainer}
							<div class="card card-compact card-bordered p-2 bg-base-100 hover:bg-base-200 transition-colors">
								<DashboardProjectComponent projectContainer={projectContainer} />
							</div>
						{/each}
					</ul>
				{:else}
					<p>Keine Projekte geladen</p>
				{/if}
			</div>
		</div>

		<div class="mt-6">
			{#if taskList.length > 0}
				<DashboardTaskComponent tasks={taskList} />
			{:else}
				<div class="card card-bordered p-4">
					No tasks loaded
				</div>
			{/if}
		</div>
	</div>

	<DashboardDeadlineComponent projects={closestDeadlineProjects} />
</div>