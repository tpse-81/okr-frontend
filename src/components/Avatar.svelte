<!--
@component
- Component for displaying projects.
- Usage:
  ```html
  <Project project={project}>
  ```
-->
<script lang="ts">
let {
	icon,
	name,
	big = false,
}: { icon: string | null; name: string; big: boolean } = $props();
</script>

<div class="avatar">
    <div class={"rounded bg-base-200 flex items-center justify-center " + (big ? "h-20 w-20" : "h-12 w-12")}>
        {#if icon}
            <img src={icon} alt="Project logo" class="object-contain" />
        {:else}
            <div class={"opacity-60 " + (big ? "text-6xl" : "text-2xl")}>
                {name.at(0) ?? ""}
            </div>
        {/if}
    </div>
</div>
