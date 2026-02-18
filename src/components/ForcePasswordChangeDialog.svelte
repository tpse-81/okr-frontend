<script lang="ts">
import { Check, CircleX, LogOut } from "@lucide/svelte";
import { goto } from "$app/navigation";
import { changeUserPassword, logout } from "$lib/api";
import type { User } from "$lib/types";
import { setUserInfo } from "$lib/user_info";
import PasswordStrengthInput from "./PasswordStrengthInput.svelte";

let {
	open = false,
	userInfo,
}: {
	open: boolean;
	userInfo: User;
} = $props();

let dialog: HTMLDialogElement;

let oldPassword = $state("");
let newPassword = $state("");
let newPasswordRepeat = $state("");
let errorMessage: string | null = $state(null);
let successMessage: string | null = $state(null);
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
	successMessage = null;

	if (!oldPassword || !newPassword || !newPasswordRepeat) {
		errorMessage = "Please fill out all fields.";
		return;
	}
	if (newPassword !== newPasswordRepeat) {
		errorMessage = "New passwords do not match.";
		return;
	}

	pending = true;
	try {
		await changeUserPassword(oldPassword, newPassword);

		// update local user cache so the app immediately unlocks navigation
		setUserInfo({ ...userInfo, must_change_password: false });
		successMessage = "Password updated.";
		oldPassword = "";
		newPassword = "";
		newPasswordRepeat = "";

		// close after state update
		dialog.close();
	} catch (err) {
		console.error(err);
		errorMessage =
			"Could not change password. Please verify your current password.";
	} finally {
		pending = false;
	}
}
</script>

<dialog bind:this={dialog} class="modal" oncancel={preventClose}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Change your password</h3>
		<p class="opacity-80 mt-2">
			Your account is using a temporary password. Please set a new password to continue.
		</p>

		{#if errorMessage}
			<div class="alert alert-error mt-4">
				<CircleX size="18" />
				<span>{errorMessage}</span>
			</div>
		{/if}
		{#if successMessage}
			<div class="alert alert-success mt-4">
				<Check size="18" />
				<span>{successMessage}</span>
			</div>
		{/if}

		<form class="mt-4 flex flex-col gap-3" onsubmit={handleSubmit}>
			<input
				type="password"
				autocomplete="current-password"
				placeholder="Current (temporary) password"
				class="input input-bordered"
				bind:value={oldPassword}
				required
			/>

			<PasswordStrengthInput
				bind:password={newPassword}
				userInfo={userInfo}
				placeholder="New password"
			/>
			<input
				type="password"
				autocomplete="new-password"
				placeholder="Repeat new password"
				class="input input-bordered"
				bind:value={newPasswordRepeat}
				required
			/>

			<div class="flex justify-between items-center mt-2">
				<button
					type="button"
					class="btn btn-ghost"
					onclick={handleLogout}
					disabled={pending}
					title="Logout"
				>
					<LogOut size="18" />
					<span>Logout</span>
				</button>
				<button class="btn btn-primary" type="submit" disabled={pending}>
					{#if pending}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					<span>Update password</span>
				</button>
			</div>
		</form>
	</div>
</dialog>
