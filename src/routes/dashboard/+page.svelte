<script lang="ts">
    import { onMount } from "svelte";
    import {getDashboard} from "$lib/api";
    import DashboardProjectComponent from "../../components/DashboardProject.svelte";
    import type {Project, ProjectContainer} from "$lib/types";

    let projectContainers: ProjectContainer[] = $state([]);
    let projectsList: Project[] = $state([]);
    let closestDeadlineProjects: Project[] = $state([]);


    onMount(async () => {
        try {
            projectContainers = await getDashboard();
            console.log(projectContainers.length);
            const rawProjects = projectContainers.map(pc => pc.project);
            projectsList = rawProjects.map(p => ({
                ...p,
                creation_date: new Date(p.creation_date),
                deadline: new Date(p.deadline)
            }));
        } catch (err) {
            console.error(err);
        }
    });

    $effect(() => {
        closestDeadlineProjects = [...projectsList]
            .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
            .slice(0, 5);
    });

</script>


<h1>Hallo Dashboard</h1>

<div class="flex gap-4 ml-5">
    <div class="flex-1">
        <div class="card card-border relative w-262">
            <div class="p-3">
                <h1>last viewed projects</h1>
                {#if projectContainers.length > 0}
                    <ul class="flex -gap-10 overflow-x-auto pb-2">
                        {#each projectContainers as projectContainer}
                            <a
                            href={`/projects/${projectContainer.project.id}`}
                            class="card card-compact card-bordered p-2 bg-base-100 hover:bg-base-200 transition-colors">
                            <DashboardProjectComponent
                                    projectContainer={projectContainer}
                            />
                            </a>
                        {/each}
                    </ul>
                {:else}
                    <p>Keine Projekte geladen</p>
                {/if}
            </div>
        </div>
    </div>

    <aside class="w-64 shrink-0 mr-5">
        <div class="card card-border">
            <div class="p-4">
                <h2 class="text-base font-semibold mb-3">Closest deadlines</h2>

                {#if closestDeadlineProjects.length > 0}
                    <div class="flex flex-col gap-3">
                        {#each closestDeadlineProjects as project}
                            <a
                                    href={`/projects/${project.id}`}
                                    class="card card-compact card-bordered p-4 bg-base-100 hover:bg-base-200 transition-colors"
                            >
                                <div class="flex flex-col gap-2">
                                <span class="font-semibold text-base truncate">
                                    {project.name}
                                </span>
                                    <span class="text-sm opacity-70">
                                    {project.deadline.toLocaleDateString()}
                                </span>
                                </div>
                            </a>
                        {/each}
                    </div>
                {:else}
                    <p class="text-sm opacity-60">No upcoming deadlines</p>
                {/if}
            </div>
        </div>
    </aside>



</div>
