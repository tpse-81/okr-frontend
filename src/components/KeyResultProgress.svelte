<script lang="ts">
import type { KeyResult } from "$lib/types";

let { keyResult }: { keyResult: KeyResult } = $props();

let progress = $derived.by(() => {
	const current = keyResult.current_value;
	const start = keyResult.start_value;
	const end = keyResult.end_value;

	const diff = Math.abs(end - start);
	if (diff === 0) return 100;

	const position = Math.abs(current - start) / diff;

	return Number((position * 100).toFixed(2));
});
</script>

<div
	class="radial-progress"
	style={`--value:${progress};`}
	aria-valuenow={progress}
	role="progressbar"
>
	{progress}%
</div>
