<script lang="ts">
import { CircleX, Info } from "@lucide/svelte";
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import {
	APIError,
	getWebauthnAuthenticationOptions,
	loginUser,
} from "$lib/api";
import type { TwoFaRequiredResponse, User } from "$lib/types";
import { setUserInfo as setUserInfoWithStorageCache } from "$lib/user_info";

let username: string = $state("");
let password: string = $state("");
let infoMessage: string = $state("");
let errorMessage: string = $state("");

// TOTP specific
let totpRequired: boolean = $state(false);
let twoFaCode: string = $state("");

// webauthn specific
let webauthnRequired: boolean = $state(false);
let userId: string | null = $state(null);
let webauthnCredential: Credential | null = $state(null);

async function login(e: SubmitEvent) {
	e.preventDefault();
	errorMessage = "";
	infoMessage = "";
	if (username === "" || password === "") {
		errorMessage = "Empty username or password.";
		return;
	}

	try {
		const userInfo: User = await loginUser(
			username,
			password,
			twoFaCode,
			webauthnCredential,
		);
		setUserInfoWithStorageCache(userInfo);
		await goto("/");
	} catch (e) {
		// correct credentials, but second factor is missing
		if (e instanceof APIError && e.response.status === 403) {
			// reset so we don't keep stale state from previous attempts
			webauthnRequired = false;
			totpRequired = false;
			webauthnCredential = null;

			const twoFaRequiredResponse: TwoFaRequiredResponse = (
				await e.response.json()
			).extra;
			userId = twoFaRequiredResponse.user_id;

			if (twoFaRequiredResponse.type === "webauthn") {
				webauthnRequired = true;
				infoMessage = "Please load your passkey.";
			}

			if (twoFaRequiredResponse.type === "totp") {
				totpRequired = true;
				infoMessage = "Please enter your 2FA code.";
			}
			return;
		}

		console.error(e);
		if (totpRequired) {
			errorMessage = "Invalid 2FA code.";
			return;
		}
		errorMessage = "Wrong username or password.";
	}
}

async function loadWebauthn() {
	if (!userId) return;

	const authenticationOptions = PublicKeyCredential.parseRequestOptionsFromJSON(
		await getWebauthnAuthenticationOptions(userId),
	);

	webauthnCredential = await navigator.credentials.get({
		publicKey: authenticationOptions,
	});
}
</script>

<div class="h-screen flex align-center">
	<form id="login-submit" onsubmit={login} class="flex flex-col justify-center gap-3 w-8/10 m-auto">
		<h1>Login</h1>
		{#if errorMessage}
		<div id="login-error" class="alert alert-error">
			<CircleX size="20" />
			<span>{errorMessage}</span>
		</div>
		{:else if infoMessage}
		<div id="login-info" class="alert alert-info">
			<Info size="20" />
			<span>{infoMessage}</span>
		</div>
		{/if}
	  <input type="text" autocomplete="username" id="username" bind:value={username} placeholder={$_('username')} class="input w-full" required>
	  <input type="password" id="password" autocomplete="current-password" bind:value={password} placeholder={$_('password')} class="input w-full" required>
	  {#if webauthnRequired}
		  <button type="button" class="btn btn-primary" onclick={() => loadWebauthn()}>Load passkey</button>
		{/if}
		{#if totpRequired}
		  <input type="text" autocomplete="one-time-code" id="two_fa_code" pattern={'\\d{3}[\\- ]?\\d{3}'} bind:value={twoFaCode} placeholder={$_('two_fa_code')} class="input w-full" required>
		{/if}
	  <input type="submit" value={$_('login')} class="btn btn-primary" disabled={(webauthnRequired && !webauthnCredential) || (totpRequired && twoFaCode.trim() === "")}>
	</form>
</div>
