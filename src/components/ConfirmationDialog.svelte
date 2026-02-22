<script lang="ts">
import { _ } from "svelte-i18n";

// svelte-ignore non_reactive_update
let modal: HTMLDialogElement;

let {
	show,
	message,
	onconfirm,
	ondismiss,
}: {
	show: boolean;
	message: string;
	onconfirm: () => void;
	ondismiss: () => void;
} = $props();

$effect(() => {
	if (show) modal.showModal();
	else modal.close();
});
</script>

<dialog id="confirmation-modal" bind:this={modal} class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">{ message }</h3>
    <p class="py-4">{$_("common.deleteConfirmation")}</p>
    <div class="modal-action">
      <form method="dialog" class="flex gap-3 w-full justify-end">
        <button class="btn" onclick={ondismiss}>{$_("common.close")}</button>
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn btn-primary" onclick={onconfirm}>{$_("common.confirm")}</button>
      </form>
    </div>
  </div>
</dialog>
