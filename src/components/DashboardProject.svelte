<!--
@component
- Component for displaying projects.
- Usage:
  ```html
  <ProjectContainer projectContainer={projectContainer}>
  ```
-->
<script lang="ts">
    import type {ProjectContainer} from "$lib/types";
    let { projectContainer }: { projectContainer: ProjectContainer } = $props();
</script>

<li class="card card-border relative w-60 shrink-0">
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
    <div class="card-body p-3 flex flex-col gap-2">
        <h2 class="card-title text-sm sm:text-base font-bold truncate">{projectContainer.project.name}</h2>
        <div class="flex items-center gap-2">
            <progress class="progress progress-primary h-2 w-full" value="{(projectContainer.progress * 100).toFixed(0)}" max="100"></progress>
            <span class="text-xs sm:text-sm font-medium">{(projectContainer.progress * 100).toFixed(0)}%</span>
        </div>
    </div>
</li>




