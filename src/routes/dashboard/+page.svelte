<script lang="ts">
    import { onMount } from "svelte";
    import {getDashboard, getTasks} from "$lib/api";
    import DashboardProjectComponent from "../../components/DashboardProject.svelte";
    import DashboardTaskComponent from "../../components/DashboardTask.svelte";
    import DashboardDeadlineComponent from "../../components/DashboardDeadline.svelte";

    import type {Project, ProjectContainer, Task} from "$lib/types";
    import {goto} from "$app/navigation";




    let projectContainers: ProjectContainer[] = $state([]);
    let projectsList: Project[] = $state([]);
    let closestDeadlineProjects: Project[] = $state([]);

    let taskList: Task[] = $state([])

    onMount(async () => {
        try {
            try {
                await tasks();
            } catch (err) {
                console.error(err);
            }
            projectContainers = await getDashboard();
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

    async function tasks() {
        try {
            taskList = await getTasks();
        } catch (err) {
            await goto("/expected");
        }
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

        <div class="card card-border relative w-389">
            <div class="p-3">
                <h1>last viewed projects</h1>
                {#if projectContainers.length > 0}
                    <ul class="flex -gap-10 overflow-x-auto pb-2">
                        {#each projectContainers as projectContainer}
                            <div  class="card card-compact card-bordered p-2 bg-base-100 hover:bg-base-200 transition-colors">
                                <DashboardProjectComponent
                                        projectContainer={projectContainer}
                                />
                            </div>
                        {/each}
                    </ul>
                {:else}
                    <p>Keine Projekte geladen</p>
                {/if}
            </div>
        </div>

        <div class="mt-6 w-389">
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