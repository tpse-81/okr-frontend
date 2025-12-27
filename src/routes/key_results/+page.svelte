<script lang="ts">
    import {
        getKeyResultObjective, createKeyResult, getKeyResults
    } from "$lib/api";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import type { KeyResult } from "$lib/types";

    let keyResultList: KeyResult[] = $state([]);
    let description: string = $state("");
    let startValue: number = $state(0);
    let endValue: number = $state(0);
    let projectID: string = $state("");
    let objectiveID: string = $state("");

    onMount(async () => {
        try {
            await keyResults();
        } catch (err) {
            console.error(err);
        }
    });

    async function keyResults() {
        try {
            keyResultList = await getKeyResults();
        } catch (err) {
            await goto("/expected")
        }
    }

    async function handleSubmit() {
        console.log("liste" + keyResultList)
        await createKeyResult(description, endValue, startValue, objectiveID, projectID);
        keyResultList = await getKeyResultObjective(objectiveID);
    }
</script>


<h1>Create a Key Result</h1>

<form id="key_result-submit" onsubmit={handleSubmit}>
    <input type="text" bind:value={projectID} placeholder="project id" >
    <input type="text" bind:value={objectiveID} placeholder="objective id" >
    <input type="text" bind:value={description} placeholder="description" >
    <input type="number" bind:value={startValue} placeholder="start value" >
    <input type="number" bind:value={endValue} placeholder="end value" >
    <input type="submit" value="Create">
</form>

<h1>Key Results</h1>
{#if keyResultList.length > 0}
    <ul class="key_result-list">
        {#each keyResultList as key_result}
            <li class="key_result-box">
                Beschreibung: <strong>{key_result.description}</strong><br>
                Start Value: {key_result.startValue}<br>
                End Value: {key_result.endValue}<br>
                <small>(ID: {key_result.id})</small><br><br>
            </li>
        {/each}
    </ul>
{:else}
    <p>Keine Key Results geladen</p>
{/if}

<style>
    #key_result-submit {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        * {
            width: min-content;
        }
    }
</style>