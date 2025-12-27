<script lang="ts">
    import { getProjects, createProject } from "$lib/api";
    import {onMount} from "svelte";
    import type { Project } from "$lib/types";

    let projectsList: Project[] = $state([]);
    let name: string = $state("");
    let deadline: number = $state(0);
    let creation_date: number = $state(0);

    onMount(async () => {
        try {
            projectsList = await getProjects();
        } catch (err) {
            console.error(err);
        }
    });

    async function handleSubmit() {
        await createProject(name, deadline, creation_date)
        projectsList = await getProjects();
    }
</script>

<h1>Create a Project</h1>

<form id="project-submit" onsubmit={handleSubmit}>
    <input type="text" bind:value={name} placeholder="Name" >
    <input type="number" bind:value={deadline} placeholder="Deadline" >
    <input type="number" bind:value={creation_date} placeholder="Creation Date" >
    <input type="submit" value="Create">
</form>

<h1>Projekte</h1>
{#if projectsList.length > 0}
    <ul class="project-list">
        {#each projectsList as project}
            <li>
                <a href={`/projects/${project.id}`} class="project-box">
                    <strong>{project.name}</strong><br>
                    Erstellung: {project.creation_date}<br>
                    Deadline: {project.deadline}<br>
                    Fertig: {project.done ? "Ja" : "Nein"}<br>
                    <small>(ID: {project.id})</small>
                </a>
            </li>
        {/each}
    </ul>
{:else}
    <p>Keine Projekte geladen</p>
{/if}

<style>
    #project-submit {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        * {
            width: min-content;
        }
    }
</style>