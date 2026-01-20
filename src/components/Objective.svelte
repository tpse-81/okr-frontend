<!--
@component
- Component for displaying objectives.
- Usage:
  ```html
  <Objective objective={objective}>
  ```
-->
<script lang="ts">
import type { Objective } from "$lib/types";

let { objective }: { objective: Objective } = $props();
</script>

<li class="card card-border">
    <a href={`/objectives/${objective.id}`} class="card-body">
        <h2 class="card-title">{objective.name}</h2>
        <p>{objective.description}</p>
    </a>
</li>
