<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import { getDashboard } from "$lib/api";
import {
	type Dashboard,
	type Project,
	type ProjectContainer,
	type Task,
	taskStateIndex,
} from "$lib/types";
import { userInfoStore } from "$lib/user_info";
import DashboardDeadlineComponent from "../../components/DashboardDeadline.svelte";
import DashboardProjectComponent from "../../components/DashboardProject.svelte";
import DashboardTaskComponent from "../../components/DashboardTask.svelte";

let projectContainers: ProjectContainer[] = $state([]);
let projectsList: Project[] = $state([]);
let closestDeadlineProjects: Project[] = $state([]);
let taskList: Task[] = $state([]);

let publicDashboard: Dashboard = $state({ projects: [], tasks: [] });
let privateDashboard: Dashboard = $state({ projects: [], tasks: [] });

// toggle
let showOnlyMine = $state(false);

onMount(async () => {
	try {
		publicDashboard = await getDashboard();

		const rawProjects = publicDashboard.projects.map((pc) => pc.project);
		projectsList = rawProjects.map((p) => ({
			...p,
			creation_date: new Date(p.creation_date),
			deadline: new Date(p.deadline),
		}));
	} catch (err) {
		console.error(err);
		await goto("/expected");
	}

	// load user's projects once
	if ($userInfoStore?.id) {
		privateDashboard = await getDashboard($userInfoStore.id);
	}
});

$effect(() => {
	// trigger reload whenever one of the dashboards changes
	if (!publicDashboard && !privateDashboard) return;

	const dashboard = showOnlyMine ? privateDashboard : publicDashboard;
	projectContainers = dashboard.projects;
	taskList = dashboard.tasks.toSorted(
		(a, b) => taskStateIndex(a.task_state) - taskStateIndex(b.task_state),
	);
});

$effect(() => {
	const source = showOnlyMine
		? projectContainers.map((pc) => pc.project)
		: projectsList;

	closestDeadlineProjects = [...source]
		.sort((a, b) => {
			const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
			const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
			return da - db;
		})
		.slice(0, 5);
});
</script>

<h1 class="ml-2 sm:ml-15">
	{#if $userInfoStore?.name}
		{$_("dashboard.greeting", { values: {name: $userInfoStore?.name ?? "" } })}
	{:else}
		{$_("dashboard.greetingNoName")}
	{/if}
</h1>

<div class="flex flex-col lg:flex-row gap-4 ml-2 mr-2 lg:ml-15">
	<!-- Main content -->
	<div class="flex-1 min-w-0">
		<div class="card card-border relative">
			<div class="p-3">
				<div class="flex items-center justify-between mb-2">
					<h1><a href="/projects">{$_("projects.title")}</a></h1>

					<button
						class="btn btn-sm btn-outline"
						onclick={() => (showOnlyMine = !showOnlyMine)}
					>
						{showOnlyMine
                            ? $_("projects.showAll")
                            : $_("projects.onlyMine")}
					</button>
				</div>
				{#if projectContainers.length > 0}
					<ul class="flex gap-3 overflow-x-auto pb-2">
						{#each projectContainers as projectContainer}
							<div
								class="card card-compact card-bordered p-2 bg-base-100 hover:bg-base-200 transition-colors shrink-0"
							>
								<DashboardProjectComponent {projectContainer} />
							</div>
						{/each}
					</ul>
				{:else}
					<p>{$_("projects.empty")}</p>
				{/if}
			</div>
		</div>

		<div class="mt-6">
			{#if taskList.length > 0}
				<DashboardTaskComponent tasks={taskList} />
			{:else}
				<div class="card card-bordered p-4">{$_("tasks.empty")}</div>
			{/if}
		</div>
	</div>

	<!-- Deadline / side panel -->
	<div class="w-full lg:w-auto">
		<DashboardDeadlineComponent projects={closestDeadlineProjects} />
	</div>
</div>
