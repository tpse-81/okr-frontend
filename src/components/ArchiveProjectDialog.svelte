<!--
@component
- Modal dialog for archiving a project with a reason.
-->
<script lang="ts">
	import type { ArchiveReason } from "$lib/types";

	let {
		show,
		projectName,
		onconfirm,
		ondismiss,
	}: {
		show: boolean;
		projectName: string;
		onconfirm: (reason: ArchiveReason) => void;
		ondismiss: () => void;
	} = $props();

	let modal: HTMLDialogElement;
	let reason: ArchiveReason = $state("on_break");

	$effect(() => {
		if (!modal) return;
		if (show) modal.showModal();
		else modal.close();
	});

	function confirm() {
		onconfirm(reason);
		ondismiss();
	}
</script>

<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Archive project</h3>
		<p class="opacity-70 mt-1">
			You are archiving <span class="font-semibold">{projectName}</span>. Please select a reason.
		</p>

		<div class="form-control mt-4">
			<label class="label" for="archive-reason">
				<span class="label-text">Reason</span>
			</label>

			<select
				id="archive-reason"
				class="select select-bordered w-full"
				bind:value={reason}
			>
				<option value="on_break">on break</option>
				<option value="finalized">finalized</option>
				<option value="give_up">give up</option>
			</select>
		</div>

		<div class="modal-action">
			<form method="dialog" class="flex gap-3 w-full justify-end">
				<button class="btn" onclick={ondismiss}>Cancel</button>
				<button class="btn btn-warning" onclick={confirm}>Archive</button>
			</form>
		</div>
	</div>
</dialog>
