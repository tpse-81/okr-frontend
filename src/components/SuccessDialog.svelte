<script lang="ts">
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
            }, 3000);
        } else {
            hideMessage();
        }
    });
</script>

{#if showMessage && message}
    <div
            in:fade={{ duration: 120 }}
            out:fade={{ duration: 240 }}
            class="toast toast-end p-2 text-sm mb-2"
    >
            <div class="alert alert-success">
                <span>{message}</span>
            </div>
    </div>
{/if}
