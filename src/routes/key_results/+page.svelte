<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
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
	<h1>{$_("keyResults.title")}</h1>
	{#if keyResultList.length > 0}
	    <ul id="key-results-list" class="grid grid-auto gap-3">
	        {#each keyResultList as key_result}
			 	    	<KeyResultComponent keyResult={key_result} onKeyResultDeleted={() => keyResultList = keyResultList.filter(kr => kr.id != key_result.id)} />
	        {/each}
	    </ul>
	{:else}
	    <p>{$_("keyResults.empty")}</p>
	{/if}
</div>
