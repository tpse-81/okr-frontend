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
		errorMessage = $_("users.login.empty");
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
				infoMessage = $_("users.login.passkey");
			}

			if (twoFaRequiredResponse.type === "totp") {
				totpRequired = true;
				infoMessage = $_("users.login.totp");
			}
			return;
		}

		console.error(e);
		if (totpRequired) {
			errorMessage = $_("users.login.invalidTotp");
			return;
		}
		errorMessage = $_("users.login.wrong");
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

<div class="flex items-center justify-center mt-50">
	<form id="login-submit" onsubmit={login}>
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-100 p-6">
			<legend class="fieldset-legend text-3xl font-semibold">{$_("users.login.title")}</legend>

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

			<label class="label" for="username">{$_("users.login.name")}</label>
			<input
					type="text"
					id="username"
					bind:value={username}
					autocomplete="username"
					placeholder={$_("users.login.name")}
					class="input w-full"
					required
			/>

			<label class="label mt-4" for="password">{$_("users.login.password")}</label>
			<input
					type="password"
					id="password"
					bind:value={password}
					autocomplete="current-password"
					placeholder={$_("users.login.password")}
					class="input w-full"
					required
			/>

			{#if webauthnRequired}
				<button
						type="button"
						class="btn btn-primary mt-4 w-full"
						onclick={() => loadWebauthn()}
				>
					{$_("users.login.loadPasskey")}
				</button>
			{/if}

			{#if totpRequired}
				<label class="label mt-4" for="two_fa_code">{$_('two_fa_code')}</label>
				<input
						type="text"
						id="two_fa_code"
						bind:value={twoFaCode}
						pattern={'\\d{3}[\\- ]?\\d{3}'}
						autocomplete="one-time-code"
						placeholder={$_('two_fa_code')}
						class="input w-full"
						required
				/>
			{/if}

			<input
					type="submit"
					value={$_("users.login.button")}
					class="btn btn-primary mt-6 w-full"
					disabled={(webauthnRequired && !webauthnCredential) || (totpRequired && twoFaCode.trim() === "")}
			/>
		</fieldset>
	</form>
</div>