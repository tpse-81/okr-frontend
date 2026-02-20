<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { Archive, Check } from "@lucide/svelte";
import { getKeyResults,getArchivedObjectives, getObjectives, getKeyResultObjective, } from "$lib/api";
import type { KeyResult, Objective } from "$lib/types";
import KeyResultComponent from "../../components/KeyResult.svelte";

let keyResultList: KeyResult[] = $state([]);
let archivedKeyResultIds: string[] = $state([]);

let activeMultiFilters = $state<string[]>([]);

const multiOptions = [
	{
		value: "archived",
		icon: Archive,
		size: 26,
		filter: (list: KeyResult[]) => {
			const archivedIds = new Set(archivedKeyResultIds);
			return list.filter((kr) => archivedIds.has(kr.id));
		},
		tooltip: "Show archived key results",
	},
];

function applyMultiFilter(value: string) {
	if (activeMultiFilters.includes(value)) {
		activeMultiFilters = activeMultiFilters.filter((v) => v !== value);
	} else {
		activeMultiFilters = [...activeMultiFilters, value];
	}
}

let visibleKeyResults = $derived.by(() => {
	let list = keyResultList;
	const archivedIds = new Set(archivedKeyResultIds);

	if (activeMultiFilters.includes("archived")) {
		list = list.filter((kr) => archivedIds.has(kr.id));
	} else {
		list = list.filter((kr) => !archivedIds.has(kr.id));
	}

	return list;
});

onMount(async () => {
	try {
		await keyResults();
	} catch (err) {
		console.error(err);
	}
});

async function keyResults() {
	try {
		const [objectives, archivedObjectives] = await Promise.all([
			getObjectives() as Promise<Objective[]>,
			getArchivedObjectives() as Promise<Objective[]>,
		]);

		const archivedObjectiveIds = new Set(archivedObjectives.map((o) => o.id));

		const krByObjective = await Promise.all(
			objectives.map(async (obj) => ({
				objectiveId: obj.id,
				keyResults: (await getKeyResultObjective(obj.id)) as KeyResult[],
			})),
		);

		const all: KeyResult[] = [];
		const archivedKR: string[] = [];

		for (const row of krByObjective) {
			all.push(...row.keyResults);

			if (archivedObjectiveIds.has(row.objectiveId)) {
				for (const kr of row.keyResults) archivedKR.push(kr.id);
			}
		}

		const archivedSet = new Set(archivedKR);
		keyResultList = all.map((kr) => ({ ...kr, is_archived: archivedSet.has(kr.id) }));
		archivedKeyResultIds = archivedKR;
	} catch (err) {
		await goto("/expected");
	}
}
</script>


<div class="p-3">
	<div class="flex justify-between items-center mb-5 gap-5">
		<h1 class="text-3xl flex-1">Key Results</h1>

		<div class="join shrink-0">
			{#each multiOptions as option}
				<div class="tooltip tooltip-left" data-tip="{option.tooltip}">
					<button
						class="btn join-item transition-transform duration-150
						{activeMultiFilters.includes(option.value) ? 'btn-active scale-110' : ''}" onclick={() => applyMultiFilter(option.value)}
					>
						<option.icon size={option.size} />
						{#if activeMultiFilters.includes(option.value)}
							<Check class="w-4 h-4 ml-1 inline-block" />
						{/if}
					</button>
				</div>
			{/each}
		</div>
	</div>

	{#if visibleKeyResults.length > 0}
		<ul id="key-results-list" class="grid grid-auto gap-3">
			{#each visibleKeyResults as key_result}
				<KeyResultComponent keyResult={key_result} onKeyResultDeleted={() => { keyResultList = keyResultList.filter((kr) => kr.id !== key_result.id); archivedKeyResultIds = archivedKeyResultIds.filter((id) => id !== key_result.id); }} />
			{/each}
		</ul>
	{:else}
		<p>No Key Results loaded</p>
	{/if}
</div>
