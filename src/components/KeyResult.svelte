<!--
@component
- Component for displaying key results.
- Usage:
  ```html
  <KeyResult keyResult={keyResult}>
  ```
-->
<script lang="ts">
import type { KeyResult } from "$lib/types";

let { keyResult }: { keyResult: KeyResult } = $props();

let progress = $derived((keyResult.start_value / keyResult.end_value) * 100);
</script>

<li class="card card-border">
    <div class="card-body">
        <h2 class="card-title">{keyResult.description}</h2>
        <div class="flex gap-4">
            <div class="radial-progress" style={`--value:${progress};`} aria-valuenow={progress} role="progressbar">{progress}%</div>
            <div>
                <p>Current: {keyResult.start_value}</p>
                <p>Goal: {keyResult.end_value}</p>
            </div>
        </div>
    </div>
</li>
