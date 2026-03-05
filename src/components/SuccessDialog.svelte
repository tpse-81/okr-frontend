<script lang="ts">
import { fade } from "svelte/transition";

let displayedMessage: string | null = null;
let timeout: ReturnType<typeof setTimeout> | null = null;

function hideMessage() {
	displayedMessage = null;
}

export function displayMessage(message: string) {
	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}

	displayedMessage = message;
	timeout = setTimeout(hideMessage, 3000);
}
</script>

{#if displayedMessage}
    <div
            in:fade={{ duration: 120 }}
            out:fade={{ duration: 240 }}
            class="toast toast-end p-2 text-sm mb-2"
    >
        <div class="alert alert-success">
            <span>{displayedMessage}</span>
        </div>
    </div>
{/if}