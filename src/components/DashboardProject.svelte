<!--
@component
- Component for displaying projects.
- Usage:
  ```html
  <ProjectContainer projectContainer={projectContainer}>
  ```
-->
<script lang="ts">
    import type { ProjectContainer } from "$lib/types";
    import { ChevronDown } from "@lucide/svelte";

    let { projectContainer }: { projectContainer: ProjectContainer } = $props();
    let showObjectives = $state(false);

    let btn: HTMLButtonElement | null = $state(null);
</script>


<li class="card card-border relative w-60 shrink-0 overflow-visible">
    <figure class="w-full h-32 overflow-hidden bg-base-200 flex items-center justify-center">
        {#if projectContainer.project.icon}
            <img
                    src="{projectContainer.project.icon}"
                    alt="{projectContainer.project.name}"
                    class="w-full h-full object-cover"
            />
        {:else}
            <div class="opacity-60 flex items-center justify-center w-full h-full text-2xl">
                {projectContainer.project.name.at(0) ?? ""}
            </div>
        {/if}
    </figure>

    <a href={`/projects/${projectContainer.project.id}`}>
        <div class="card-body p-3 flex flex-col gap-2">
            <h2 class="card-title text-sm sm:text-base font-bold truncate">
                {projectContainer.project.name}
            </h2>

            <div class="flex items-center gap-2">
                <progress
                        class="progress progress-primary h-2 w-full"
                        value="{(projectContainer.progress * 100).toFixed(0)}"
                        max="100">
                </progress>
                <span class="text-xs sm:text-sm font-medium">
                    {(projectContainer.progress * 100).toFixed(0)}%
                </span>
            </div>
        </div>
    </a>
    <div class="divider flex">Objectives</div>

    <button
            bind:this={btn}
            type="button"
            class="btn btn-xs btn-ghost z-20"
            onclick={() => showObjectives = !showObjectives}
    >
        <ChevronDown class="h-3 w-3"/>
    </button>
    {#if showObjectives && btn}
        {@const r = btn.getBoundingClientRect()}

        <div
                class="fixed z-50 bg-base-100 border rounded-lg shadow-lg p-3 text-sm"
                style="
            left: {r.left}px;
            top: {r.bottom + 8}px;
            width: {r.width}px;
        "
        >
            <div class="font-semibold mb-1">Objectives</div>
            <ul class="list-disc list-inside space-y-1">
                {#each projectContainer.objectives as obj}
                    <a href={`/objectives/${obj.id}`}>
                        <div>
                            {obj.name}
                        </div>
                    </a>
                {/each}
            </ul>
        </div>
    {/if}

</li>




