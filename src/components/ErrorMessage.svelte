<script lang="ts">
import { CircleX } from "@lucide/svelte";
import { fade } from "svelte/transition";

let { message }: { message: string | null } = $props();

let showMessage = $state(false);
let timeout: ReturnType<typeof setTimeout> | null = null;

function hideMessage() {
	showMessage = false;
}

$effect(() => {
	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}

	if (message) {
		showMessage = true;

		timeout = setTimeout(() => {
			hideMessage();
		}, 1500);
	} else {
		hideMessage();
	}
});
</script>

{#if showMessage && message}
    <div
            in:fade={{ duration: 120 }}
            out:fade={{ duration: 240 }}
            class="alert alert-error p-2 text-sm mb-2"
    >
    		<CircleX size="20" />
        <span>{message}</span>
    </div>
{/if}
