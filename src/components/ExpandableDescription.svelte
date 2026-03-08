<script lang="ts">
import { _ } from "svelte-i18n";

let { text = "", bigText = false }: { text?: string; bigText?: boolean } =
	$props();

let modal: HTMLDialogElement;

function open() {
	modal?.showModal();
}
</script>

<div class="flex items-start gap-1 min-w-0" data-no-navigation>
	<p
		class="w-full break-words whitespace-pre-wrap line-clamp-3 min-w-0 {bigText ? 'font-bold' : ''}"
	>
		{text}
	</p>

	<span
		role="button"
		tabindex="0"
		class="btn btn-ghost btn-xs px-1"
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			open();
		}}
		onkeydown={(e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				e.stopPropagation();
				open();
			}
		}}
	>
		...
	</span>
</div>

<dialog bind:this={modal} class="modal">
	<div
		class="modal-box"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<p class="whitespace-pre-wrap break-words">{text}</p>
		<div class="modal-action">
			<form method="dialog">
				<button
					class="btn"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						modal.close();
					}}
				>
					{$_("common.done")}
				</button>
			</form>
		</div>
	</div>
</dialog>
