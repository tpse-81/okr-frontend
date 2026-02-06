<script lang="ts">
import { _ } from "svelte-i18n";
import { goto } from "$app/navigation";
import {
	APIError,
	getWebauthnAuthenticationOptions,
	loginUser,
} from "$lib/api";
import { setUserInfo as setUserInfoWithStorageCache } from "$lib/user_info";
import type { TwoFaRequiredResponse, User } from "$lib/types";

let username: string = $state("");
let password: string = $state("");
let errorMessage: string = $state("");

// webauthn specific
let webauthnRequired: boolean = $state(false);
let userId: string | null = $state(null);
let webauthnCredential: Credential | null = $state(null);

async function login(e: SubmitEvent) {
	e.preventDefault();
	errorMessage = "";
	if (username === "" || password === "") {
		errorMessage = "Empty username or password.";
		return;
	}

	try {
		const userInfo: User = await loginUser(
			username,
			password,
			null,
			webauthnCredential,
		);
		setUserInfoWithStorageCache(userInfo);
		await goto("/");
	} catch (e) {
		// correct credentials, but second factor is missing
		if (e instanceof APIError && e.response.status === 403) {
			const twoFaRequiredResponse: TwoFaRequiredResponse = (
				await e.response.json()
			).extra;
			userId = twoFaRequiredResponse.user_id;
			if (twoFaRequiredResponse.type === "webauthn") webauthnRequired = true;
			return;
		}
		console.error(e);
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
		<div class="alert alert-error">
			<span>{errorMessage}</span>
		</div>
		{/if}
	  <input type="text" id="username" bind:value={username} placeholder={$_('username')} class="input w-full" >
	  <input type="password" id="password" bind:value={password} placeholder={$_('password')} class="input w-full" >
	  {#if webauthnRequired}
		  <button type="button" class="btn btn-primary" onclick={() => loadWebauthn()}>Load passkey</button>
		{/if}
	  <input type="submit" value={$_('login')} class="btn btn-primary" disabled={webauthnRequired && !webauthnCredential}>
	</form>
</div>
