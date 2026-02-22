<script lang="ts">
import { _, locale } from "svelte-i18n";
import type { Project } from "$lib/types";
import { formatDate } from "$lib/utils";

const { projects } = $props<{
	projects: Project[];
}>();
</script>

<aside class="w-64 shrink-0 mr-5">
    <div class="card card-border">
        <div class="p-4">
            <h2 class="text-base font-semibold mb-3">{$_("dashboard.upcomingDeadline")}</h2>

            {#if projects.length > 0}
                <div class="flex flex-col gap-3">
                    {#each projects as project}
                        <a
                                href={`/projects/${project.id}`}
                                class="card card-compact card-bordered p-4 bg-base-100 hover:bg-base-200 transition-colors"
                        >
                            <div class="flex flex-col gap-2">
                                <span class="font-semibold text-base truncate">
                                    {project.name}
                                </span>
                                <span class="text-sm opacity-70">
                                    {formatDate(new Date(project.deadline), $locale)}
                                </span>
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <p class="text-sm opacity-60">{$_("dashboard.noUpcomingDeadlines")}</p>
            {/if}
        </div>
    </div>
</aside>
