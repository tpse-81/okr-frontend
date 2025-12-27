<script lang="ts">
    import { createObjective, getObjectiveProject} from "$lib/api";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import type { Objective } from "$lib/types";

    let { data } = $props();

    let project_id = $derived(data.project_id);
    let project_name = $derived(data.project_name);

    let objectivelist: Objective[] = $state([]);
    let name: string = $state("");
    let description: string = $state("");

    onMount(async () => {
        try {
            await objectives();
        } catch (err) {
            console.error(err);
        }
    });

    async function objectives() {
        try {
            objectivelist = await getObjectiveProject(project_id);
        } catch (err) {
            await goto("/expected")
        }
    }

    async function handleSubmit() {
        await createObjective(name, description, project_id);
        objectivelist = await getObjectiveProject(project_id);
    }
</script>

<h1>Create an Objective for {project_name}</h1>

<form id="objective-submit" onsubmit={handleSubmit}>
    <input type="text" bind:value={name} placeholder="Name" >
    <input type="text" bind:value={description} placeholder="description" >
    <input type="submit" value="Create">
</form>


    <h1>Objectives for {project_name}</h1>
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