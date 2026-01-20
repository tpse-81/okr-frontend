<!--
@component
- Component for displaying projects.
- Usage:
  ```html
  <Project project={project}>
  ```
-->
<script lang="ts">
import { Check, Info } from "@lucide/svelte";
import type { Project } from "$lib/types";
import { formatDate, formatDeadline } from "$lib/utils";
import AvatarComponent from "./Avatar.svelte";

let { project }: { project: Project } = $props();
</script>

<li class="card card-border">
    <a href={`/projects/${project.id}`} class="card-body">
        {#if project.done}
            <div class="badge badge-success self-end"><Check size="16" /> Done</div>
        {:else}
            <div class="badge badge-info self-end"><Info size="16" /> {formatDeadline(new Date(project.deadline))}</div>
        {/if}
        <div class="card-title flex">
            <AvatarComponent icon={project.icon ?? null} name={project.name} big={false} />
            <h2>{project.name}</h2>
        </div>
        <p>Erstellt am {formatDate(new Date(project.creation_date))}</p>
        <p>Fällig am {formatDate(new Date(project.deadline))}</p>
    </a>
</li>
