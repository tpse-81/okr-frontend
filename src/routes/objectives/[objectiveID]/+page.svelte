<script lang="ts">
    import {
        getKeyResultObjective,
        createKeyResult
    } from "$lib/api";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import type { KeyResult } from "$lib/types";
    import { _ } from "svelte-i18n";

    let { data } = $props();

    let objectiveID = $derived(data.objectiveID);
    let objectiveName = $derived(data.objectiveName);
    let projectID = $derived(data.parentID);

    let keyResultList: KeyResult[] = $state([]);

    let description: string = $state("");
    let startValue: number = $state(0);
    let endValue: number = $state(0);

    onMount(async () => {
        try {
            await loadKeyResults();
        } catch (err) {
            console.error(err);
        }
    });

    async function loadKeyResults() {
        try {
            keyResultList = await getKeyResultObjective(objectiveID);
        } catch (err) {
            await goto("/expected");
        }
    }

    async function handleSubmit() {
        await createKeyResult(
            description,
            endValue,
            startValue,
            objectiveID,
            projectID
        );

        keyResultList = await getKeyResultObjective(objectiveID);
    }
</script>

<h1>{$_('createKeyResult')} {$_('for')} {objectiveName}</h1>

<form id="keyResultSubmit" onsubmit={handleSubmit} class="flex gap-3 p-3">
    <input type="text" bind:value={description} placeholder={$_('description')} class="input w-full">
    <input type="number" bind:value={startValue} placeholder={$_('startValue')} class="input w-full">
    <input type="number" bind:value={endValue} placeholder={$_('endValue')} class="input w-full">
    <input type="submit" value="Create" class="btn btn-primary">
</form>

<div class="p-3">
    <h1>{$_('keyResults')} {$_('for')} {objectiveName}</h1>
    {#if keyResultList.length > 0}
        <ul class="grid grid-auto gap-3">
            {#each keyResultList as keyResult}
                <li class="card card-border">
                    <div class="card-body">
                        Beschreibung: <strong>{keyResult.description}</strong><br>
                        Start Value: {keyResult.startValue}<br>
                        End Value: {keyResult.endValue}<br>
                        <small>(ID: {keyResult.id})</small><br><br>
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <p>Keine Key Results geladen</p>
    {/if}
</div>
