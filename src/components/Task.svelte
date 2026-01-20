<!--
@component
- Component for displaying tasks.
- Usage:
  ```html
  <Task task={task}>
  ```
-->
<script lang="ts">
import type { Task } from "$lib/types";

let { task }: { task: Task } = $props();
</script>

<li class="card card-border">
  <a href={`/objectives/${task.id}`} class="card-body">
      Name: <strong>{task.description}</strong><br>
      Description: {task.description}<br>
        State: {task.task_state}<br>
      <small>(ID: {task.id})</small><br><br>
  </a>
</li>
