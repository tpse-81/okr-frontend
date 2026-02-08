<script lang="ts">
import { onMount } from "svelte";
import type { User } from "$lib/types";
import { userInfoStore } from "$lib/user_info";

import ErrorMessage from "../../components/ErrorMessage.svelte";
import ConfirmationDialog from "../../components/ConfirmationDialog.svelte";

import { createUser, getUsers, deleteUser, changeUserPassword } from "$lib/api";

import { generatePassword, copyToClipboard } from "$lib/utils";
import { Check, Minus } from "@lucide/svelte";

let name: string = $state("");
let password: string = $state("");
let email: string = $state("");

let users: User[] = $state([]);
let loading = $state(false);
let errorMessage: string | null = $state(null);

let showDeleteDialog = $state(false);
let userToDelete: User | null = $state(null);

// Passwort-Anzeige Modal (für Create + nach PW-Change)
let passwordModal: HTMLDialogElement;
let showPasswordDialog = $state(false);
let passwordDialogTitle = $state("");
let passwordDialogText = $state("");

// Set-Password Modal (Admin kann tippen ODER generieren)
let setPasswordModal: HTMLDialogElement;
let showSetPasswordDialog = $state(false);
let userForPassword: User | null = $state(null);
let passwordInput = $state("");

$effect(() => {
	if (!passwordModal) return;
	if (showPasswordDialog) passwordModal.showModal();
	else passwordModal.close();
});

$effect(() => {
	if (!setPasswordModal) return;
	if (showSetPasswordDialog) setPasswordModal.showModal();
	else setPasswordModal.close();
});

async function refreshUsers() {
	loading = true;
	errorMessage = null;
	try {
		users = await getUsers();
	} catch (e) {
		console.error(e);
		errorMessage = "Konnte User nicht laden.";
	} finally {
		loading = false;
	}
}

function openPasswordDialog(title: string, text: string) {
	passwordDialogTitle = title;
	passwordDialogText = text;
	showPasswordDialog = true;
}

// Create User
async function onCreateUser(e: SubmitEvent) {
	e.preventDefault();
	errorMessage = null;

	// wenn Admin nichts eingibt, nutzen wir random (8 Zeichen)
	if (!password) password = generatePassword();

	try {
		await createUser(name, email, password);

		openPasswordDialog(
			"User erstellt",
			`User: ${name}\nEmail: ${email}\nPasswort: ${password}`,
		);

		name = "";
		email = "";
		password = generatePassword();

		await refreshUsers();
	} catch (e) {
		console.error(e);
		errorMessage = "User erstellen fehlgeschlagen.";
	}
}

function openSetPassword(u: User) {
	userForPassword = u;
	passwordInput = generatePassword(); // default 8
	showSetPasswordDialog = true;
}

async function confirmSetPassword() {
	if (!userForPassword) return;
	errorMessage = null;

	try {
		await changeUserPassword(userForPassword.id, "", passwordInput);

		showSetPasswordDialog = false;

		openPasswordDialog(
			"Passwort geändert",
			`User: ${userForPassword.name}\nEmail: ${userForPassword.email}\nNeues Passwort: ${passwordInput}`,
		);

		userForPassword = null;
		passwordInput = "";
	} catch (e) {
		console.error(e);
		errorMessage = "Passwort ändern fehlgeschlagen.";
	}
}

function dismissSetPassword() {
	showSetPasswordDialog = false;
	userForPassword = null;
	passwordInput = "";
}

function askDelete(u: User) {
	userToDelete = u;
	showDeleteDialog = true;
}

async function confirmDelete() {
	if (!userToDelete) return;

	errorMessage = null;
	try {
		await deleteUser(userToDelete.id);
		showDeleteDialog = false;
		userToDelete = null;
		await refreshUsers();
	} catch (e) {
		console.error(e);
		errorMessage = "User löschen fehlgeschlagen.";
	}
}

function dismissDelete() {
	showDeleteDialog = false;
	userToDelete = null;
}

// can't be put into onMount because it's a race condition
// whether $userInfoStore is initialized first or we check if
// the user is admin
$effect(() => {
	if ($userInfoStore?.is_admin) refreshUsers();
	else users = [];
});

onMount(() => {
	password = generatePassword();
});
</script>

<ErrorMessage message={errorMessage} />

<h1>Create User</h1>

{#if !$userInfoStore?.is_admin}
	<p class="p-3 opacity-70">Nur Admins können User verwalten.</p>
{:else}
	<form id="user-submit" onsubmit={(e) => void onCreateUser(e)} class="flex gap-3 p-3 m-auto">
		<input
			type="text"
			pattern="^((?!@).)*$"
			bind:value={name}
			placeholder="Name"
			class="input w-full"
			required
		/>

		<input
			type="text"
			bind:value={password}
			placeholder="Password"
			class="input w-full"
			required
			title="Du kannst das Passwort ändern oder neu generieren"
		/>

		<button type="button" class="btn" onclick={() => (password = generatePassword())}>
			Neu generieren
		</button>

		<input
			type="email"
			bind:value={email}
			placeholder="Email"
			class="input w-full"
			required
		/>

		<input type="submit" value="Create" class="btn btn-primary" />
	</form>

	<div class="p-3">
		<h2 class="text-xl font-semibold mb-2">Users</h2>

		{#if loading}
			<span class="loading loading-spinner loading-md"></span>
		{:else if users.length === 0}
			<p class="opacity-70">Keine User vorhanden.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Admin</th>
							<th class="text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each users as u}
							<tr>
								<td>{u.name}</td>
								<td>{u.email}</td>
								<td>
									{#if u.is_admin}
										<Check size={16} />
									{:else}
										<Minus size={16} class="opacity-50" />
									{/if}
								</td>
								<td class="text-right">
									<div class="flex gap-2 justify-end">
										<button class="btn btn-sm" onclick={() => openSetPassword(u)}>
											Set PW
										</button>

										<button
											class="btn btn-sm btn-error"
											disabled={u.id === $userInfoStore?.id}
											onclick={() => askDelete(u)}
											title={u.id === $userInfoStore?.id
												? "Du kannst dich nicht selbst löschen"
												: ""}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
{/if}

<ConfirmationDialog
	show={showDeleteDialog}
	message={userToDelete ? `User "${userToDelete.name}" löschen?` : "User löschen?"}
	onconfirm={() => void confirmDelete()}
	ondismiss={dismissDelete}
/>

<dialog bind:this={setPasswordModal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Passwort setzen</h3>

		{#if userForPassword}
			<p class="opacity-70 mb-3">
				{userForPassword.name} ({userForPassword.email})
			</p>
		{/if}

		<div class="flex gap-2">
			<input
				type="text"
				class="input input-bordered w-full"
				bind:value={passwordInput}
				placeholder="Neues Passwort"
				required
			/>
			<button type="button" class="btn" onclick={() => (passwordInput = generatePassword())}>
				Random
			</button>
		</div>

		<div class="modal-action">
			<form method="dialog" class="flex gap-3 w-full justify-end">
				<button class="btn" onclick={dismissSetPassword}>Cancel</button>
				<button class="btn btn-primary" onclick={() => void confirmSetPassword()}>
					Save
				</button>
			</form>
		</div>
	</div>
</dialog>

<dialog bind:this={passwordModal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">{passwordDialogTitle}</h3>
		<p class="py-4 whitespace-pre-line">{passwordDialogText}</p>
		<div class="modal-action">
			<form method="dialog" class="flex gap-3 w-full justify-end">
				<button class="btn" onclick={() => void copyToClipboard(passwordDialogText)}>
					Copy
				</button>
				<button class="btn btn-primary" onclick={() => (showPasswordDialog = false)}>
					OK
				</button>
			</form>
		</div>
	</div>
</dialog>
