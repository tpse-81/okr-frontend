<script lang="ts">
    import {getObjectives, createObjective} from "$lib/api";
    import { goto } from "$app/navigation";
    import {onMount} from "svelte";
    import type { Objective } from "$lib/types";

    let objectivelist: Objective[] = $state([]);
    let name: string = $state("");
    let description: string = $state("");
    let projectID: string = $state("");


    onMount(async () => {
        try {
            await objectives();
        } catch (err) {
            console.error(err);
        }
    });

    async function objectives() {
        try {
            objectivelist = await getObjectives();
        } catch (err) {
            goto("/expected")
        }
    }

    async function createProjects() {
        await createObjective(name, description, projectID);
    }
</script>

<h1>Create an Objective</h1>

<form id="objective-submit" onsubmit={createProjects}>
    <input type="text" bind:value={name} placeholder="Name" >
    <input type="text" bind:value={description} placeholder="Deadline" >
    <input type="text" bind:value={projectID} placeholder="project id" >
    <input type="submit" value="Create">
</form>


<h1>Objectives</h1>

{#if objectivelist.length > 0}
    <ul class="objective-list">
        {#each objectivelist as objective}
            <li>
                <a href={`/objectives/${objective.id}`} class="objective-box">
                    Name: <strong>{objective.name}</strong><br>
                    Beschreibung: {objective.description}<br>
                    <small>(ID: {objective.id})</small><br><br>
                </a>
            </li>
        {/each}
    </ul>
{:else}
    <p>Keine Objectives geladen</p>
{/if}

<style>
    #objective-submit {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        * {
            width: min-content;
        }
    }
</style>