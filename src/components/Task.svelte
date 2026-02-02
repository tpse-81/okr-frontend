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
  <div class="card-body">
      {task.description}<br>
      (State: {task.task_state})<br>
  </div>
</li>
