<script lang="ts">
import { onMount } from "svelte";
import type { User } from "$lib/types";
import { userInfoStore } from "$lib/user_info";

import ErrorMessage from "../../components/ErrorMessage.svelte";
import ConfirmationDialog from "../../components/ConfirmationDialog.svelte";

import { createUser, getUsers, deleteUser, changeUserPassword } from "$lib/api";

let name: string = $state("");
let passwort: string = $state("");
let email: string = $state("");

let users: User[] = $state([]);
let loading = $state(false);
let errorMessage: string | null = $state(null);

let showDeleteDialog = $state(false);
let userToDelete: User | null = $state(null);

let passwordModal: HTMLDialogElement;
let showPasswordDialog = $state(false);
let passwordDialogTitle = $state("");
let passwordDialogText = $state("");

$effect(() => {
	if (!passwordModal) return;
	if (showPasswordDialog) passwordModal.showModal();
	else passwordModal.close();
});

function generatePassword(length = 16) {
	const charset =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
	const buf = new Uint32Array(length);
	crypto.getRandomValues(buf);
	return Array.from(buf, (x) => charset[x % charset.length]).join("");
}

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

async function copyToClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		// fallback
		const el = document.createElement("textarea");
		el.value = text;
		document.body.appendChild(el);
		el.select();
		document.execCommand("copy");
		document.body.removeChild(el);
	}
}

async function screateUser(e: SubmitEvent) {
	e.preventDefault();
	errorMessage = null;

	if (!passwort) passwort = generatePassword();

	try {
		await createUser(name, email, passwort);

		openPasswordDialog(
			"User erstellt",
			`User: ${name}\nEmail: ${email}\nPasswort: ${passwort}`,
		);

		name = "";
		email = "";
		passwort = generatePassword();

		await refreshUsers();
	} catch (e) {
		console.error(e);
		errorMessage = "User erstellen fehlgeschlagen.";
	}
}

async function resetPassword(u: User) {
	errorMessage = null;
	const newPw = generatePassword();

	try {
		await changeUserPassword(u.id, "", newPw);

		openPasswordDialog(
			"Passwort zurückgesetzt",
			`User: ${u.name}\nEmail: ${u.email}\nNeues Passwort: ${newPw}`,
		);
	} catch (e) {
		console.error(e);
		errorMessage = "Passwort-Reset fehlgeschlagen.";
	}
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

onMount(() => {
	passwort = generatePassword();

	if ($userInfoStore?.is_admin) {
		refreshUsers();
	}
});
</script>

<ErrorMessage message={errorMessage} />

<h1>Create User</h1>

{#if !$userInfoStore?.is_admin}
	<p class="p-3 opacity-70">Nur Admins können User verwalten.</p>
{:else}
	<form id="user-submit" onsubmit={screateUser} class="flex gap-3 p-3 m-auto">
		<!-- username pattern allows everything but '@' characters -->
		<input
			type="text"
			pattern="^((?!@).)*$"
			bind:value={name}
			placeholder="Name"
			class="input w-full"
			required
		/>

		<!-- Password is shown in UI and generated randomly -->
		<input
			type="text"
			bind:value={passwort}
			placeholder="Passwort"
			class="input w-full"
			readonly
			required
			title="Automatisch generiert"
		/>

		<!-- Button for generation -->
		<button
			type="button"
			class="btn"
			onclick={() => (passwort = generatePassword())}
		>
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
								<td>{u.is_admin ? "✅" : "—"}</td>
								<td class="text-right">
									<div class="flex gap-2 justify-end">
										<button class="btn btn-sm" onclick={() => resetPassword(u)}>
											Reset PW
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
	onconfirm={confirmDelete}
	ondismiss={dismissDelete}
/>

<dialog bind:this={passwordModal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">{passwordDialogTitle}</h3>
		<p class="py-4 whitespace-pre-line">{passwordDialogText}</p>
		<div class="modal-action">
			<form method="dialog" class="flex gap-3 w-full justify-end">
				<button class="btn" onclick={() => copyToClipboard(passwordDialogText)}>
					Copy
				</button>
				<button class="btn btn-primary" onclick={() => (showPasswordDialog = false)}>
					OK
				</button>
			</form>
		</div>
	</div>
</dialog>