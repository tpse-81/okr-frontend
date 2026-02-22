<script lang="ts">
import {
	AArrowDown,
	AArrowUp,
	Archive,
	Check,
	ClockArrowDown,
	ClockArrowUp,
	UserRound,
} from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import {
	createProject,
	getArchivedProjects,
	getProjects,
	getProjectsForUser,
} from "$lib/api";
import type { Project } from "$lib/types";
// biome-ignore lint/style/useImportType: IconSelector is a component and not a type
import IconSelector from "../../components/IconSelector.svelte";

let iconSelectorRef: IconSelector | null = null;

import ProjectComponent from "../../components/Project.svelte";

let projectsList: Project[] = $state([]);
let name: string = $state("");
let deadline: string = $state(new Date().toISOString().split("T")[0]);

let archivedProjectsList: Project[] = $state([]);
let userProjectsList: Project[] = $state([]);

import { restoreUserInfoFromStorage, userInfoStore } from "$lib/user_info";

let icon: string | null = $state(null);
let iconRequiresConfirmation: boolean = $state(false);
let activeFilter = $state<string | null>(null);
let activeMultiFilters = $state<string[]>([]);
let searchTerm = $state("");

const singleOptions = [
	{
		value: "alphabetDescending",
		icon: AArrowDown,
		size: 26,
		compare: (a: Project, b: Project) => b.name.localeCompare(a.name),
		tooltip: "projects.tooltipSortByNameDescending",
	}, // A to Z
	{
		value: "alphabetAscending",
		icon: AArrowUp,
		size: 26,
		compare: (a: Project, b: Project) => a.name.localeCompare(b.name),
		tooltip: "projects.tooltipSortByNameAscending",
	}, // Z to A
	{
		value: "closestDeadline",
		icon: ClockArrowUp,
		size: 20,
		compare: (a: Project, b: Project) =>
			new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
		tooltip: "projects.tooltipSortbyDeadlineDescending",
	}, // most urgent to least urgent
	{
		value: "furthestDeadline",
		icon: ClockArrowDown,
		size: 20,
		compare: (a: Project, b: Project) =>
			new Date(b.deadline).getTime() - new Date(a.deadline).getTime(),
		tooltip: "projects.tooltipSortByDeadlineAscending",
	}, // lest urgent to most urgent
];

const multiOptions = [
	{
		value: "ownProjects",
		icon: UserRound,
		size: 26,
		filter: (list: Project[]) => {
			const userProjects = new Set(userProjectsList.map((p) => p.id));
			return list.filter((p) => userProjects.has(p.id));
		},
		tooltip: "projects.tooltipMy",
	},
	{
		value: "archived",
		icon: Archive,
		size: 26,
		filter: (list: Project[]) => {
			const archivedIds = new Set(archivedProjectsList.map((p) => p.id));
			return list.filter((p) => archivedIds.has(p.id));
		},
		tooltip: "projects.tooltipArchived",
	},
];

let visibleProjects = $derived.by(() => {
	let searchedlist = projectsList.filter((project) =>
		project.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	for (const option of multiOptions) {
		if (activeMultiFilters.includes(option.value)) {
			searchedlist = option.filter(searchedlist);
		}
	}

	if (activeFilter) {
		searchedlist = sortProjectList(searchedlist, activeFilter);
	}
	return searchedlist;
});

function sortProjectList(list: Project[], filter: string) {
	let compareFn = singleOptions.find((a) => a.value === filter)?.compare;
	if (compareFn) {
		return [...list].sort(compareFn);
	}
	return list;
}

function applySingleFilter(filter: string) {
	activeFilter = activeFilter === filter ? null : filter;
}

function applyMultiFilter(value: string) {
	if (activeMultiFilters.includes(value)) {
		activeMultiFilters = activeMultiFilters.filter((v) => v !== value);
	} else {
		activeMultiFilters = [...activeMultiFilters, value];
	}
}

onMount(async () => {
	try {
		restoreUserInfoFromStorage();

		const userID = $userInfoStore?.id ?? "";

		const userProjectsPromise = userID
			? getProjectsForUser(userID)
			: Promise.resolve([]);

		const [userProjects, archivedProjects, projects] = await Promise.all([
			userProjectsPromise,
			getArchivedProjects(),
			getProjects(),
		]);

		userProjectsList = userProjects;
		archivedProjectsList = archivedProjects;
		projectsList = projects;
	} catch (err) {
		console.error(err);
	}
});

async function handleSubmit(e: SubmitEvent) {
	e.preventDefault();

	await createProject(name, new Date(deadline), icon);
	projectsList = await getProjects();
	name = "";
	deadline = new Date().toISOString().split("T")[0]; // reset to today after submit

	icon = null;
	iconRequiresConfirmation = false;

	// reset internal state of IconSelector (preview, file input, etc.)
	iconSelectorRef?.discardIcon();
}
</script>

<h1>{$_("projects.createTitle")}</h1>

<form id="project-submit" onsubmit={handleSubmit} class="p-3">
  <div class="card bg-base-100 border border-base-300">
    <div class="card-body gap-4">

      <h2 class="card-title">{$_("projects.createTitle")}</h2>

      <IconSelector bind:this={iconSelectorRef} initialIcon={null} onStateChanged={(newIcon, needsConfirm) => {icon = newIcon; iconRequiresConfirmation = needsConfirm;}} />

      <!-- Inputs: nice grid -->
      <div class="grid grid-auto gap-3">
        <div class="form-control">
            <label for="project-name" class="label">
                <span class="label-text">{$_("common.name")}</span>
            </label>
            <input
                id="project-name"
                type="text"
                bind:value={name}
                placeholder={$_("common.name")}
                class="input input-bordered w-full"
                required
            />
        </div>

        <div class="form-control">
            <label for="project-deadline" class="label">
                <span class="label-text">{$_("projects.deadline")}</span>
            </label>
            <input
                id="project-deadline"
                type="date"
                bind:value={deadline}
                placeholder={$_("projects.deadline")}
                class="input input-bordered w-full"
                required
            />
        </div>
      </div>

      <div class="card-actions justify-end">
        <button class="btn btn-primary" type="submit" disabled={iconRequiresConfirmation}>
          {$_("common.create")}
        </button>
      </div>
    </div>
  </div>
</form>

<div class="p-3">
    <div class="flex justify-between items-center mb-5 gap-5">
        <div class="flex gap-5 items-center flex-1">
            <h1 class="text-3xl">{$_("projects.title")}</h1>
            <div class="join">
                <input
                        type="text"
                        bind:value={searchTerm}
                        placeholder={$_("common.searchName")}
                        class="input"
                        style="border-radius: 10px 0 0 10px;"
                />
                {#each singleOptions as option}
                    <div class="tooltip" data-tip={$_(option.tooltip)}>
                        <button
                                class="btn join-item transition-transform duration-150
                                {activeFilter === option.value ? 'btn-active scale-110' : ''}"
                                onclick={() => applySingleFilter(option.value)}
                        >
                            <option.icon size={option.size} />
                            {#if activeFilter === option.value}
                                <Check class="w-4 h-4 ml-1 inline-block" />
                            {/if}
                        </button>
                    </div>
                {/each}
            </div>
        </div>
        <div class="join shrink-0">
            {#each multiOptions as option}
                <div class="tooltip tooltip-left" data-tip={$_(option.tooltip)}>
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

    {#if visibleProjects.length > 0}
      <ul id="projects-list" class="grid gap-3 grid-auto">
          {#each visibleProjects as project}
            <ProjectComponent project={project} onProjectDeleted={() => projectsList = projectsList.filter(proj => proj.id != project.id)} />
          {/each}
      </ul>
  {:else}
      <p>{$_("projects.empty")}</p>
  {/if}
</div>

