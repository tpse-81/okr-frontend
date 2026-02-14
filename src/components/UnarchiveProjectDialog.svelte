<!--
@component
- Modal dialog for unarchiving a project with a new deadline.
-->
<script lang="ts">
	let {
		show,
		projectName,
		initialDeadline,
		onconfirm,
		ondismiss,
	}: {
		show: boolean;
		projectName: string;
		initialDeadline: Date;
		onconfirm: (newDeadline: Date) => void;
		ondismiss: () => void;
	} = $props();

	let modal: HTMLDialogElement;

	function toDateInputValue(date: Date): string {
		return new Date(date).toISOString().slice(0, 10);
	}

	let deadlineStr: string = $state("");

	$effect(() => {
		if (!modal) return;

		if (show) {
			deadlineStr = toDateInputValue(initialDeadline);
			modal.showModal();
		} else {
			modal.close();
		}
	});

	function confirm() {
		if (!deadlineStr) return;
		const [y, m, d] = deadlineStr.split("-").map(Number);
		const newDeadline = new Date(y, (m ?? 1) - 1, d ?? 1);

		onconfirm(newDeadline);
		ondismiss();
	}
</script>

<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Unarchive project</h3>
		<p class="opacity-70 mt-1">
			You are unarchiving <span class="font-semibold">{projectName}</span>. Please set a new deadline.
		</p>

		<div class="form-control mt-4">
			<label class="label" for="unarchive-deadline">
				<span class="label-text">New deadline</span>
			</label>

			<input
				id="unarchive-deadline"
				type="date"
				class="input input-bordered w-full"
				bind:value={deadlineStr}
				required
			/>
		</div>

		<div class="modal-action">
			<form method="dialog" class="flex gap-3 w-full justify-end">
				<button class="btn" onclick={ondismiss}>Cancel</button>
				<button class="btn btn-success" disabled={!deadlineStr} onclick={confirm}>
					Unarchive
				</button>
			</form>
		</div>
	</div>
</dialog>
