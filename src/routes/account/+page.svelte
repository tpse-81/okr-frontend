<script lang="ts">
import { Check } from "@lucide/svelte";
import QrCode from "qrcode";
import { onMount } from "svelte";
import { get } from "svelte/store";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import {
	APIError,
	changePassword,
	changeUserPassword,
	deleteUser,
	getWebauthnAuthenticationOptions,
	getWebauthnRegistrationOptions,
	logout,
	totpConfirm,
	totpDisable,
	totpIsConfigured,
	totpSetup,
	webauthnAuthenticate,
	webauthnIsConfigured,
	webauthnRegister,
	webauthnRemoveCredentials,
} from "$lib/api";
import { setUserInfo, userInfoStore } from "$lib/user_info";
import ConfirmationDialog from "../../components/ConfirmationDialog.svelte";
import ErrorMessage from "../../components/ErrorMessage.svelte";
import PasswordStrengthInput from "../../components/PasswordStrengthInput.svelte";

let isWebauthnConfigured = $state(false);
let errorMessage: string | null = $state(null);
let successMessage: string = $state($_("account.passkeys.configuredInfo"));

// --- Change password ---
let oldPassword: string = $state("");
let newPassword: string = $state("");
let newPasswordRepeat: string = $state("");
let passwordError: string | null = $state(null);
let passwordSuccess: string | null = $state(null);

// --- TOTP 2FA ---
let isTotpConfigured = $state(false);
let totpSetupData: { secret: string; otpauth_uri: string } | null =
	$state(null);

let totpSetupQrCodeUrl: string | null = $state(null);
let totpConfirmCode: string = $state("");
let totpDisableCode: string = $state("");
let totpError: string | null = $state(null);
let totpSuccess: string | null = $state(null);

$effect(() => {
	// generate a TOTP setup QR code that can be scanned
	// by 2FA apps to automatically store the 2FA token
	if (totpSetupData) {
		QrCode.toDataURL(totpSetupData?.otpauth_uri, (err, url) => {
			if (!err) totpSetupQrCodeUrl = url;
		});
	} else {
		totpSetupQrCodeUrl = null;
	}
});

// --- Delete account ---
let showDeleteDialog: boolean = $state(false);
let deleteError: string | null = $state(null);

async function registerWebauthn() {
	const registrationOptions = PublicKeyCredential.parseCreationOptionsFromJSON(
		await getWebauthnRegistrationOptions(),
	);

	const credential = await navigator.credentials.create({
		publicKey: registrationOptions,
	});

	// if credential is null, the user canceled it
	if (!credential) return;

	try {
		await webauthnRegister(credential);
		isWebauthnConfigured = true;
		// biome-ignore lint: exceptions are always of type any
	} catch (e: any) {
		errorMessage = e.toString();
	}
}

async function loginWebauthn() {
	const userId = get(userInfoStore)?.id;
	if (!userId) return;

	const authenticationOptions = PublicKeyCredential.parseRequestOptionsFromJSON(
		await getWebauthnAuthenticationOptions(userId),
	);

	const credential = await navigator.credentials.get({
		publicKey: authenticationOptions,
	});

	// if credential is null, the user canceled it
	if (!credential) return;

	try {
		await webauthnAuthenticate(userId, credential);
		successMessage = $_("account.passkeys.verifiedSuccess");
		// biome-ignore lint: exceptions are always of type any
	} catch (e: any) {
		errorMessage = e.toString;
	}
}

async function deleteWebauthnCredentials() {
	const userId = get(userInfoStore)?.id;
	if (!userId) return;

	const authenticationOptions = PublicKeyCredential.parseRequestOptionsFromJSON(
		await getWebauthnAuthenticationOptions(userId),
	);

	const credential = await navigator.credentials.get({
		publicKey: authenticationOptions,
	});

	// if credential is null, the user canceled it
	if (!credential) return;

	try {
		await webauthnRemoveCredentials(userId, credential);
		isWebauthnConfigured = false;
		// biome-ignore lint: exceptions are always of type any
	} catch (e: any) {
		errorMessage = e.toString();
	}
}

async function handleChangePassword(e: SubmitEvent) {
	e.preventDefault();
	passwordError = null;
	passwordSuccess = null;

	const userId = get(userInfoStore)?.id;
	if (!userId) return;

	if (!oldPassword || !newPassword || !newPasswordRepeat) {
		passwordError = $_("account.password.fillAllError");
		return;
	}
	if (newPassword !== newPasswordRepeat) {
		passwordError = $_("account.password.mismatchError");
		return;
	}

	try {
		await changePassword(userId, oldPassword, newPassword);

		if ($userInfoStore?.must_change_password) {
			setUserInfo({ ...$userInfoStore, must_change_password: false });
		}

		passwordSuccess = $_("account.password.changedSuccess");
		oldPassword = "";
		newPassword = "";
		newPasswordRepeat = "";
	} catch (e) {
		console.error(e);
		passwordError = $_("account.password.changeFailedError");
	}
}

async function startTotpSetup() {
	isTotpConfigured = false;
	totpError = null;
	totpSuccess = null;

	const userId = get(userInfoStore)?.id;
	if (!userId) return;

	try {
		totpSetupData = await totpSetup(userId);
		totpSuccess = $_("account.totp.createdSuccess");
	} catch (e) {
		console.error(e);
		if (e instanceof APIError) console.log(await e.response.json());
		totpError = $_("account.totp.setupFailedError");
	}
}

async function confirmTotp() {
	totpError = null;
	totpSuccess = null;

	const userId = get(userInfoStore)?.id;
	if (!userId) return;

	if (!totpConfirmCode) {
		totpError = $_("account.totp.enterCodeError");
		return;
	}

	try {
		await totpConfirm(userId, totpConfirmCode);
		isTotpConfigured = true;
		totpSuccess = $_("account.totp.enabledSuccess");
		totpConfirmCode = "";
		totpSetupData = null;
	} catch (e) {
		console.error(e);
		totpError = $_("account.totp.invalidCodeError");
	}
}

async function disableTotp() {
	totpError = null;
	totpSuccess = null;

	const userId = get(userInfoStore)?.id;
	if (!userId) return;

	if (!totpDisableCode) {
		totpError = $_("account.totp.enterCodeError");
		return;
	}

	try {
		await totpDisable(userId, totpDisableCode);
		totpSuccess = $_("account.totp.disabledSuccess");
		totpDisableCode = "";
		totpSetupData = null;
		isTotpConfigured = false;
	} catch (e) {
		console.error(e);
		totpError = $_("account.totp.disableFailedError");
	}
}

async function confirmDeleteAccount() {
	deleteError = null;

	const userId = get(userInfoStore)?.id;
	if (!userId) {
		deleteError = $_("account.delete.notLoggedInError");
		return;
	}

	try {
		await deleteUser(userId);
	} catch (e) {
		console.error(e);
		deleteError = $_("account.delete.failedError");
		return;
	}

	// logout can fail after deletion, but we still want to clear local state
	try {
		await logout();
	} catch (e) {
		console.warn("logout failed after delete:", e);
	}

	setUserInfo(null);
	await goto("/");
}

$effect(() => {
	(async () => {
		const userId = $userInfoStore?.id;
		if (!userId) return;

		isTotpConfigured = await totpIsConfigured(userId);
		if (isTotpConfigured) totpSuccess = $_("account.totp.enabledInfo");
	})();
});

onMount(async () => {
	isWebauthnConfigured = await webauthnIsConfigured();
});
</script>

<div class="p-3">
	<h2>{$_("account.title")}</h2>
	<div class="card card-border mt-3">
		<div class="card-body">
			<h2 class="card-title">{$_("account.password.title")}</h2>

			<ErrorMessage message={passwordError} />
			{#if passwordSuccess}
				<div class="alert alert-success">
					<Check size="16" />
					<span>{passwordSuccess}</span>
				</div>
			{/if}

			<form
				class="flex flex-col gap-3 max-w-full"
				onsubmit={handleChangePassword}
			>
				<input
					type="password"
					placeholder={$_("account.password.current")}
					class="input input-bordered"
					bind:value={oldPassword}
				>

				<PasswordStrengthInput
					bind:password={newPassword}
					userInfo={$userInfoStore!}
					placeholder={$_("account.password.new")}
				/>
				<PasswordStrengthInput
					bind:password={newPasswordRepeat}
					userInfo={$userInfoStore!}
					placeholder={$_("account.password.repeat")}
				/>
				<div>
					<button class="btn btn-primary w-max" type="submit">
						{$_("account.password.change")}
					</button>
				</div>
			</form>
		</div>
	</div>
	<div class="card card-border mt-3">
		<div class="card-body">
			<h2 class="card-title">{$_("account.totp.title")}</h2>

			<ErrorMessage message={totpError} />
			{#if totpSuccess}
				<div class="alert alert-success">
					<Check size="16" />
					<span>{totpSuccess}</span>
				</div>
			{/if}

			<div class="flex flex-col gap-3">
				<div class="text-sm opacity-80">{$_("account.totp.description")}</div>

				<div class="flex gap-3 flex-wrap">
					<button
						class="btn btn-primary w-max"
						type="button"
						onclick={() => startTotpSetup()}
					>
						{$_("account.totp.generate")}
					</button>
				</div>

				{#if totpSetupData}
					<div class="alert flex">
						<div class="flex flex-col gap-2 w-full">
							<div>
								<div class="font-semibold">{$_("account.totp.secret")}</div>
								<code class="break-all">{totpSetupData.secret}</code>
								<div class="text-xs opacity-70 mt-1">
									{$_("account.totp.secretHint")}
								</div>
							</div>

							<div class="flex flex-col gap-2">
								<label class="label" for="token-input">
									<span class="label-text">{$_("account.totp.confirm")}</span>
								</label>
								<input
									type="text"
									id="token-input"
									placeholder="123456"
									class="input input-bordered"
									bind:value={totpConfirmCode}
								>
								<div>
									<button
										class="btn btn-primary w-max"
										type="button"
										onclick={() => confirmTotp()}
									>
										{$_("account.totp.confirm")}
									</button>
								</div>
							</div>
						</div>
						{#if totpSetupQrCodeUrl}
							<img src={totpSetupQrCodeUrl} alt={$_("account.totp.qrAlt")}>
						{/if}
					</div>
				{/if}

				{#if isTotpConfigured}
					<div class="divider divider-neutral"></div>
					<div class="flex flex-col gap-2">
						<label class="label">
							<span class="label-text">{$_("account.totp.disable")}</span>
						</label>
						<input
							type="text"
							placeholder="123456"
							class="input input-bordered"
							bind:value={totpDisableCode}
						>
						<button
							class="btn w-max"
							type="button"
							onclick={() => disableTotp()}
						>
							{$_("account.totp.disable")}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="card card-border mt-3">
		<div class="card-body">
			<h2 class="card-title">{$_("account.passkeys.title")}</h2>

			<ErrorMessage message={errorMessage} />
			{#if !isWebauthnConfigured}
				<button
					class="btn btn-primary w-max"
					onclick={() => registerWebauthn()}
				>
					{$_("account.passkeys.register")}
				</button>
			{/if}
			{#if isWebauthnConfigured}
				<div class="alert alert-success">
					<Check size="16" />
					<span>{successMessage}</span>
				</div>

				<div class="flex gap-3">
					<button class="btn btn-primary w-max" onclick={() => loginWebauthn()}>
						{$_("account.passkeys.login")}
					</button>
					<button
						class="btn btn-primary w-max"
						onclick={() => deleteWebauthnCredentials()}
					>
						{$_("account.passkeys.remove")}
					</button>
				</div>
			{/if}
		</div>
	</div>
	<div class="card card-border mt-3">
		<div class="card-body">
			<h2 class="card-title">{$_("account.delete.title")}</h2>

			<ErrorMessage message={deleteError} />
			<div class="text-sm opacity-80">{$_("account.delete.description")}</div>
			<button
				class="btn btn-error w-max mt-2"
				type="button"
				onclick={() => (showDeleteDialog = true)}
			>
				{$_("account.delete.action")}
			</button>
		</div>
	</div>

	<ConfirmationDialog
		show={showDeleteDialog}
		message={$_("account.delete.title")}
		onconfirm={() => {
      showDeleteDialog = false;
      confirmDeleteAccount();
    }}
		ondismiss={() => {
      showDeleteDialog = false;
    }}
	/>
</div>
