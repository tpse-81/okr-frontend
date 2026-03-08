<script lang="ts">
import { Check, KeyRound, Minus, Trash, UserStar } from "@lucide/svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import {
	createUser,
	deleteUser,
	getUsers,
	promoteUser,
	resetUserPassword,
} from "$lib/api";
import type { User } from "$lib/types";
import { userInfoStore } from "$lib/user_info";
import { copyToClipboard, generatePassword } from "$lib/utils";
import ConfirmationDialog from "../../components/ConfirmationDialog.svelte";
import ErrorMessage from "../../components/ErrorMessage.svelte";

let name: string = $state("");
let password: string = $state("");
let email: string = $state("");

let users: User[] = $state([]);
let adminCount = $derived(users.filter((u) => u.is_admin).length);
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

// Promote to admin
let showPromoteToAdminDialog = $state(false);
let userForPromotion: User | null = $state(null);

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
		errorMessage = $_("users.cannotLoadError");
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
			$_("users.creationSuccess"),
			$_("users.creationSuccessBody", { values: { name, email, password } }),
		);

		name = "";
		email = "";
		password = generatePassword();

		await refreshUsers();
	} catch (e) {
		console.error(e);
		errorMessage = $_("users.creationError");
	}
}

function openSetPassword(u: User) {
	userForPassword = u;
	passwordInput = generatePassword(); // default 8
	showSetPasswordDialog = true;
}

function openPromoteToAdmin(u: User) {
	userForPromotion = u;
	showPromoteToAdminDialog = true;
}

async function confirmSetPassword() {
	if (!userForPassword) return;
	errorMessage = null;

	try {
		await resetUserPassword(userForPassword.id, passwordInput);

		showSetPasswordDialog = false;

		openPasswordDialog(
			$_("users.passwordChangeSuccess"),
			$_("users.creationSuccessBody", {
				values: {
					name: userForPassword.name,
					email: userForPassword.email,
					password: passwordInput,
				},
			}),
		);

		userForPassword = null;
		passwordInput = "";
	} catch (e) {
		console.error(e);
		errorMessage = $_("users.passwordChangeError");
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
		errorMessage = $_("users.deletionError");
	}
}

function dismissDelete() {
	showDeleteDialog = false;
	userToDelete = null;
}

async function confirmPromoteUserToAdmin() {
	if (!userForPromotion) return;

	errorMessage = null;
	try {
		await promoteUser(userForPromotion.id);
		showPromoteToAdminDialog = false;
		userForPromotion = null;
		await refreshUsers();
	} catch (e) {
		console.error(e);
		errorMessage = $_("users.promoteToAdminError");
	}
}

function dismissPromoteToAdmin() {
	showPromoteToAdminDialog = false;
	userForPromotion = null;
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

<h1 class="p-3">{$_("users.createTitle")}</h1>

{#if !$userInfoStore?.is_admin}
	<p class="p-3 opacity-70">Nur Admins können User verwalten.</p>
{:else}
	<form
		id="user-submit"
		onsubmit={(e) => void onCreateUser(e)}
		class="flex flex-col md:flex-row gap-3 p-3 m-auto"
	>
		<input
			type="text"
			pattern="^((?!@).)*$"
			bind:value={name}
			placeholder={$_("common.name")}
			class="input w-full"
			required
		>

		<div class="flex gap-2 w-full">
			<input
				type="text"
				bind:value={password}
				placeholder={$_("users.login.password")}
				class="input w-full"
				required
				title={$_("users.tooltipPasswordChange")}
			>

			<button
				type="button"
				class="btn whitespace-nowrap"
				onclick={() => (password = generatePassword())}
			>
				{$_("users.generatePasswordButton")}
			</button>
		</div>

		<input
			type="email"
			bind:value={email}
			placeholder={$_("users.email")}
			class="input w-full"
			required
		>

		<input type="submit" value="Create" class="btn btn-primary">
	</form>

	<div class="p-3">
		<h2 class="text-xl font-semibold mb-2">{$_("users.titlePlural")}</h2>

		{#if loading}
			<span class="loading loading-spinner loading-md"></span>
		{:else if users.length === 0}
			<p class="opacity-70">{$_("users.empty")}</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="table table-sm w-full">
					<thead>
						<tr>
							<th>{$_("common.name")}</th>
							<th>{$_("users.email")}</th>
							<th>{$_("users.admin")}</th>
							<th class="text-right">{$_("users.actions")}</th>
						</tr>
					</thead>
					<tbody>
						{#each users as u}
							<tr>
								<td>{u.name}</td>
								<td class="break-all">{u.email}</td>
								<td>
									{#if u.is_admin}
										<Check size={16} />
									{:else}
										<Minus size={16} class="opacity-50" />
									{/if}
								</td>
								<td class="text-right">
									<div class="flex gap-2 justify-end">
										{#if !u.is_admin}
											<button
												class="btn btn-sm btn-square tooltip tooltip-left"
												data-tip={$_("users.setPassword")}
												onclick={() => openSetPassword(u)}
												title={$_("users.setPassword")}
											>
												<KeyRound size={16} />
											</button>

											<button
												class="btn btn-sm btn-warning btn-square tooltip tooltip-left"
												data-tip={$_("users.promoteToAdmin")}
												onclick={() => openPromoteToAdmin(u)}
												title={$_("users.promoteToAdmin")}
											>
												<UserStar size={16} />
											</button>
										{/if}

										<button
											class="btn btn-sm btn-error btn-square pointer-events-auto tooltip tooltip-left"
											data-tip={u.id === $userInfoStore?.id && adminCount == 1
													? $_("users.deleteSelfError")
													: u.id !== $userInfoStore.id && u.is_admin
													? $_("users.deleteAdminError")
													: $_("common.delete")}
											disabled={($userInfoStore.id !== u.id && u.is_admin) || ($userInfoStore.id === u.id && adminCount == 1)}
											onclick={() => askDelete(u)}
										>
											<Trash size={16} />
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
	message={userToDelete ? $_("users.deletionQuestionWithName", {values: {name: userToDelete.name}}) : $_("users.deletionQuestion")}
	onconfirm={() => void confirmDelete()}
	ondismiss={dismissDelete}
/>

<ConfirmationDialog
	show={showPromoteToAdminDialog}
	message={userForPromotion ? $_("users.promoteToAdminMessage", {values: {name: userForPromotion.name}}) : $_("users.promoteToAdmin")}
	explanation={$_("users.promoteToAdminWarning")}
	onconfirm={() => void confirmPromoteUserToAdmin()}
	ondismiss={dismissPromoteToAdmin}
/>

<dialog bind:this={setPasswordModal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">{$_("users.setPassword")}</h3>

		{#if userForPassword}
			<p class="opacity-70 mb-3">
				{userForPassword.name}
				({userForPassword.email})
			</p>
		{/if}

		<div class="flex gap-2">
			<input
				type="text"
				class="input input-bordered w-full"
				bind:value={passwordInput}
				placeholder={$_("users.account.password.new")}
				required
			>
			<button
				type="button"
				class="btn"
				onclick={() => (passwordInput = generatePassword())}
			>
				{$_("users.random")}
			</button>
		</div>

		<div class="modal-action">
			<form method="dialog" class="flex gap-3 w-full justify-end">
				<button class="btn" onclick={dismissSetPassword}>Cancel</button>
				<button
					class="btn btn-primary"
					onclick={() => void confirmSetPassword()}
				>
					{$_("common.save")}
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
				<button
					class="btn"
					onclick={() => void copyToClipboard(passwordDialogText)}
				>
					{$_("common.copy")}
				</button>
				<button
					class="btn btn-primary"
					onclick={() => (showPasswordDialog = false)}
				>
					OK
				</button>
			</form>
		</div>
	</div>
</dialog>
