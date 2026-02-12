<script lang="ts">
import { Check } from "@lucide/svelte";
import { onMount } from "svelte";
import { get } from "svelte/store";
import { goto } from "$app/navigation";
import {
	APIError,
	changePassword,
	deleteUser,
	getWebauthnAuthenticationOptions,
	getWebauthnRegistrationOptions,
	logout,
	totpConfirm,
	totpDisable,
	totpSetup,
	webauthnAuthenticate,
	webauthnIsConfigured,
	webauthnRegister,
	webauthnRemoveCredentials,
} from "$lib/api";
import { setUserInfo, userInfoStore } from "$lib/user_info";
import ConfirmationDialog from "../../components/ConfirmationDialog.svelte";
import ErrorMessage from "../../components/ErrorMessage.svelte";

let isWebauthnConfigured = $state(false);
let errorMessage: string | null = $state(null);
let successMessage: string = $state("Passkey configured properly");

// --- Change password ---
let oldPassword: string = $state("");
let newPassword: string = $state("");
let newPasswordRepeat: string = $state("");
let passwordError: string | null = $state(null);
let passwordSuccess: string | null = $state(null);

// --- TOTP 2FA ---
let totpSetupData: { secret: string; otpauth_uri: string } | null =
	$state(null);
let totpConfirmCode: string = $state("");
let totpDisableCode: string = $state("");
let totpError: string | null = $state(null);
let totpSuccess: string | null = $state(null);

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
		successMessage = "Success! Your passkey works as expected.";
		// biome-ignore lint: exceptions are always of type any
	} catch (e: any) {
		errorMessage = e.toString();
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
	if (!userId) {
		passwordError = "You are not logged in.";
		return;
	}
	if (!oldPassword || !newPassword || !newPasswordRepeat) {
		passwordError = "Please fill out all fields.";
		return;
	}
	if (newPassword !== newPasswordRepeat) {
		passwordError = "New passwords do not match.";
		return;
	}

	try {
		const res = await changePassword(userId, oldPassword, newPassword);
		passwordSuccess = res.message;
		oldPassword = "";
		newPassword = "";
		newPasswordRepeat = "";
	} catch (e) {
		console.error(e);
		passwordError = "Could not change password.";
	}
}

async function startTotpSetup() {
	totpError = null;
	totpSuccess = null;

	const userId = get(userInfoStore)?.id;
	if (!userId) {
		totpError = "You are not logged in.";
		return;
	}

	try {
		totpSetupData = await totpSetup(userId);
		totpSuccess =
			"New 2FA token created. Add it to your authenticator app, then confirm with a code.";
	} catch (e) {
		console.error(e);
		if (e instanceof APIError) console.log(await e.response.json());
		totpError = "Could not start 2FA setup.";
	}
}

async function confirmTotp() {
	totpError = null;
	totpSuccess = null;

	const userId = get(userInfoStore)?.id;
	if (!userId) {
		totpError = "You are not logged in.";
		return;
	}
	if (!totpConfirmCode) {
		totpError = "Please enter a 2FA code.";
		return;
	}

	try {
		const res = await totpConfirm(userId, totpConfirmCode);
		totpSuccess = res.message;
		totpConfirmCode = "";
		totpSetupData = null;
	} catch (e) {
		console.error(e);
		totpError = "Invalid 2FA code.";
	}
}

async function disableTotp() {
	totpError = null;
	totpSuccess = null;

	const userId = get(userInfoStore)?.id;
	if (!userId) {
		totpError = "You are not logged in.";
		return;
	}
	if (!totpDisableCode) {
		totpError = "Please enter a 2FA code.";
		return;
	}

	try {
		const res = await totpDisable(userId, totpDisableCode);
		totpSuccess = res.message;
		totpDisableCode = "";
		totpSetupData = null;
	} catch (e) {
		console.error(e);
		totpError = "Could not disable 2FA.";
	}
}

async function confirmDeleteAccount() {
	deleteError = null;

	const userId = get(userInfoStore)?.id;
	if (!userId) {
		deleteError = "You are not logged in.";
		return;
	}

	try {
		await deleteUser(userId);
	} catch (e) {
		console.error(e);
		deleteError = "Could not delete your account.";
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

onMount(async () => {
	isWebauthnConfigured = await webauthnIsConfigured();
});
</script>

<div class="p-3">
  <h2>Configure Account</h2>
  <div class="card card-border mt-3">
    <h2 class="card-title">Change password</h2>
    <div class="card-body">
      <ErrorMessage message={passwordError} />
      {#if passwordSuccess}
        <div class="alert alert-success">
          <Check size="16" />
          <span>{passwordSuccess}</span>
        </div>
      {/if}

      <form class="flex flex-col gap-3" onsubmit={handleChangePassword}>
        <input
          type="password"
          placeholder="Current password"
          class="input input-bordered"
          bind:value={oldPassword}
        />
        <input
          type="password"
          placeholder="New password"
          class="input input-bordered"
          bind:value={newPassword}
        />
        <input
          type="password"
          placeholder="Repeat new password"
          class="input input-bordered"
          bind:value={newPasswordRepeat}
        />
        <div>
          <button class="btn btn-primary w-max" type="submit">Change password</button>
        </div>
      </form>
    </div>
  </div>
  <div class="card card-border mt-3">
    <h2 class="card-title">Authenticator app (TOTP)</h2>
    <div class="card-body">
      <ErrorMessage message={totpError} />
      {#if totpSuccess}
        <div class="alert alert-success">
          <Check size="16" />
          <span>{totpSuccess}</span>
        </div>
      {/if}

      <div class="flex flex-col gap-3">
        <div class="text-sm opacity-80">
          Use this if you want to set up or replace your 2FA token. After enabling it, you will have to enter a 6-digit code when logging in.
        </div>

        <div class="flex gap-3 flex-wrap">
          <button class="btn btn-primary w-max" type="button" onclick={() => startTotpSetup()}>
            Generate new token
          </button>
        </div>

        {#if totpSetupData}
          <div class="alert">
            <div class="flex flex-col gap-2 w-full">
              <div>
                <div class="font-semibold">Secret</div>
                <code class="break-all">{totpSetupData.secret}</code>
                <div class="text-xs opacity-70 mt-1">
                  If you cannot scan a QR code, most authenticator apps let you add an account by entering this secret manually.
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label class="label"><span class="label-text">Confirm token</span></label>
                <input
                  type="text"
                  placeholder="123456"
                  class="input input-bordered"
                  bind:value={totpConfirmCode}
                />
                <div>
                  <button class="btn btn-primary w-max" type="button" onclick={() => confirmTotp()}>
                    Confirm token
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <div class="flex flex-col gap-2">
          <label class="label"><span class="label-text">Disable 2FA</span></label>
          <input
            type="text"
            placeholder="123456"
            class="input input-bordered"
            bind:value={totpDisableCode}
          />
          <button class="btn btn-ghost w-max" type="button" onclick={() => disableTotp()}>
            Disable 2FA
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="card card-border mt-3">
  	<h2 class="card-title">Webauthn</h2>

  	<div class="card-body">
		  <ErrorMessage message={errorMessage} />
		  {#if !isWebauthnConfigured}
			  <button class="btn btn-primary w-max" onclick={() => registerWebauthn()}>Register passkey</button>
		  {/if}
		  {#if isWebauthnConfigured}
		  	<div class="alert alert-success">
		  		<Check size="16" />
		  		<span>{ successMessage }</span>
				</div>

				<div class="flex gap-3">
				  <button class="btn btn-primary w-max" onclick={() => loginWebauthn()}>Login with passkey</button>
				  <button class="btn btn-primary w-max" onclick={() => deleteWebauthnCredentials()}>Delete passkey</button>
			  </div>
		  {/if}
	  </div>
  </div>
    <div class="card card-border mt-3">
    <h2 class="card-title">Delete account</h2>
    <div class="card-body">
      <ErrorMessage message={deleteError} />
      <div class="text-sm opacity-80">
        This will permanently delete your user and all your associations (for example project memberships). You will be logged out.
      </div>
      <button
        class="btn btn-error w-max mt-2"
        type="button"
        onclick={() => (showDeleteDialog = true)}
      >
        Delete my account
      </button>
    </div>
  </div>

  <ConfirmationDialog
    show={showDeleteDialog}
    message="Delete account"
    onconfirm={() => {
      showDeleteDialog = false;
      confirmDeleteAccount();
    }}
    ondismiss={() => {
      showDeleteDialog = false;
    }}
  />
</div>
