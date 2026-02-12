<script lang="ts">
import type { Objective } from "$lib/types";

let {
	objective,
	isLinked,
	onIsLinkedChange,
}: {
	objective: Objective;
	isLinked: boolean;
	onIsLinkedChange: (isLinked: boolean) => void;
} = $props();

// svelte-ignore state_referenced_locally
let isLinkedState = $state(isLinked);
</script>

<tr>
	<td>{ objective.name }</td>
	<td>{ objective.description }</td>
	<td><input class="checkbox" type="checkbox" bind:checked={isLinkedState} onchange={() => onIsLinkedChange(isLinkedState)} /></td>
</tr>
