<script lang="ts">
import { Archive, Check } from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import { getArchivedKeyResults, getKeyResults } from "$lib/api";
import type { KeyResult } from "$lib/types";
import KeyResultComponent from "../../components/KeyResult.svelte";

let keyResultList: KeyResult[] = $state([]);
let archivedKeyResultIds: string[] = $state([]);

let activeMultiFilters = $state<string[]>([]);

const multiOptions = [
	{
		value: "archived",
		icon: Archive,
		size: 26,
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
	if (activeMultiFilters.includes("archived")) {
		return keyResultList.filter((kr) => kr.is_archived === true);
	}
	return keyResultList.filter((kr) => kr.is_archived !== true);
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
		const [all, archived] = await Promise.all([
			getKeyResults() as Promise<KeyResult[]>,
			getArchivedKeyResults() as Promise<KeyResult[]>,
		]);

		const archivedIds = new Set(archived.map((kr) => kr.id));

		keyResultList = all.map((kr) => ({
			...kr,
			is_archived: archivedIds.has(kr.id),
		}));
	} catch (err) {
		await goto("/expected");
	}
}
</script>


<div class="p-3">
  <div class="flex justify-between items-center mb-5 gap-5">
    <h1 class="text-3xl flex-1">{$_("keyResults.title")}</h1>

    <div class="join shrink-0">
      {#each multiOptions as option}
        <div class="tooltip tooltip-left" data-tip="{option.tooltip}">
          <button
            class="btn join-item transition-transform duration-150
            {activeMultiFilters.includes(option.value) ? 'btn-active scale-110' : ''}"
            onclick={() => applyMultiFilter(option.value)}
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
        <KeyResultComponent
          keyResult={key_result}
          onKeyResultDeleted={() => {
            keyResultList = keyResultList.filter((kr) => kr.id !== key_result.id);
          }}
        />
      {/each}
    </ul>
  {:else}
    <p>{$_("keyResults.empty")}</p>
  {/if}
</div>