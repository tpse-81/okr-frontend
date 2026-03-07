<script lang="ts">
import { CircleX, LogOut } from "@lucide/svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import { changeUserPassword, logout } from "$lib/api";
import type { User } from "$lib/types";
import { setUserInfo } from "$lib/user_info";
import PasswordStrengthInput from "./PasswordStrengthInput.svelte";

let {
	open = false,
	userInfo,
	ondismiss,
}: {
	open: boolean;
	userInfo: User;
	ondismiss: () => void;
} = $props();

let dialog: HTMLDialogElement;

let oldPassword = $state("");
let newPassword = $state("");
let newPasswordRepeat = $state("");
let errorMessage: string | null = $state(null);
let pending = $state(false);

$effect(() => {
	if (!dialog) return;
	if (open && !dialog.open) dialog.showModal();
	// intentionally not closing the dialog automatically
});

function preventClose(e: Event) {
	// prevent ESC / default cancel behaviour; users must complete the flow
	e.preventDefault();
}

async function handleLogout() {
	try {
		await logout();
	} catch {
		// ignore
	}
	setUserInfo(null);
	await goto("/login");
}

async function handleSubmit(e: SubmitEvent) {
	e.preventDefault();
	errorMessage = null;

	if (!oldPassword || !newPassword || !newPasswordRepeat) {
		errorMessage = $_("account.password.fillAllError");
		return;
	}
	if (newPassword !== newPasswordRepeat) {
		errorMessage = $_("account.password.mismatchError");
		return;
	}

	pending = true;
	try {
		await changeUserPassword(oldPassword, newPassword);

		// update local user cache so the app immediately unlocks navigation
		setUserInfo({ ...userInfo, must_change_password: false });
		oldPassword = "";
		newPassword = "";
		newPasswordRepeat = "";

		// close after state update
		dialog.close();
	} catch (err) {
		console.error(err);
		errorMessage = $_("account.password.changeFailedError");
	} finally {
		pending = false;
	}
}
</script>

<dialog
	bind:this={dialog}
	class="modal"
	oncancel={preventClose}
	onclose={ondismiss}
>
	<div class="modal-box">
		<h3 class="text-lg font-bold">{$_("account.password.title")}</h3>
		<p class="opacity-80 mt-2">
			{$_("account.password.temporaryPasswordWarning")}
		</p>

		{#if errorMessage}
			<div class="alert alert-error mt-4">
				<CircleX size="18" />
				<span>{errorMessage}</span>
			</div>
		{/if}

		<form class="mt-4 flex flex-col gap-3" onsubmit={handleSubmit}>
			<input
				type="password"
				autocomplete="current-password"
				placeholder={$_("account.password.current")}
				class="input input-bordered w-full"
				bind:value={oldPassword}
				required
			>

			<PasswordStrengthInput
				bind:password={newPassword}
				{userInfo}
				placeholder={$_("account.password.new")}
				class="w-full"
			/>
			<PasswordStrengthInput
				bind:password={newPasswordRepeat}
				{userInfo}
				placeholder={$_("account.password.repeat")}
				class="w-full"
			/>

			<div class="flex justify-between items-center mt-2">
				<button
					type="button"
					class="btn btn-ghost"
					onclick={handleLogout}
					disabled={pending}
					title={$_("nav.logout")}
				>
					<LogOut size="18" />
					<span>{$_("nav.logout")}</span>
				</button>
				<button class="btn btn-primary" type="submit" disabled={pending}>
					{#if pending}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					<span>{$_("users.setPassword")}</span>
				</button>
			</div>
		</form>
	</div>
</dialog>
