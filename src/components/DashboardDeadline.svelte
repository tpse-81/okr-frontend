<script lang="ts">
import { _, locale } from "svelte-i18n";
import type { Project } from "$lib/types";
import { formatDate } from "$lib/utils";

const { projects } = $props<{
	projects: Project[];
}>();
</script>

<aside class="w-full lg:w-64 shrink-0 lg:mr-5">
    <div class="card card-border">
        <div class="p-3 lg:p-4">
            <h2 class="text-sm lg:text-base font-semibold mb-2 lg:mb-3">
                {$_("dashboard.upcomingDeadline")}
            </h2>

            {#if projects.length > 0}
                <div class="flex flex-col gap-2 lg:gap-3">
                    {#each projects as project}
                        <a
                                href={`/projects/${project.id}`}
                                class="card card-compact card-bordered p-2 lg:p-4 bg-base-100 hover:bg-base-200 transition-colors"
                        >
                            <div class="flex flex-col gap-1 lg:gap-2">
                                <span class="font-semibold text-sm lg:text-base truncate">
                                    {project.name}
                                </span>
                                <span class="text-xs lg:text-sm opacity-70">
                                    {formatDate(new Date(project.deadline), $locale)}
                                </span>
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <p class="text-xs lg:text-sm opacity-60">
                    {$_("dashboard.noUpcomingDeadlines")}
                </p>
            {/if}
        </div>
    </div>
</aside>
