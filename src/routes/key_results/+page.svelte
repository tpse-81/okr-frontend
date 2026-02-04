<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { getKeyResults } from "$lib/api";
import type { KeyResult } from "$lib/types";
import KeyResultComponent from "../../components/KeyResult.svelte";

let keyResultList: KeyResult[] = $state([]);

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
		await goto("/expected");
	}
}
</script>

<div class="p-3">
	<h1>Key Results</h1>
	{#if keyResultList.length > 0}
	    <ul class="grid grid-auto gap-3">
	        {#each keyResultList as key_result}
			 	    	<KeyResultComponent keyResult={key_result} onKeyResultDeleted={() => keyResultList = keyResultList.filter(kr => kr.id != key_result.id)} />
	        {/each}
	    </ul>
	{:else}
	    <p>Keine Key Results geladen</p>
	{/if}
</div>
