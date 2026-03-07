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

$effect(() => {
	isLinkedState = isLinked;
});
</script>

<tr>
	<td class="truncate max-w-64">{objective.name}</td>
	<td class="truncate max-w-96">{objective.description}</td>
	<td>
		<input
			class="checkbox"
			type="checkbox"
			bind:checked={isLinkedState}
			onchange={() => onIsLinkedChange(isLinkedState)}
		>
	</td>
</tr>
