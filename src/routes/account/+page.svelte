<script lang="ts">
import {
	getWebauthnAuthenticationOptions,
	getWebauthnRegistrationOptions,
	webauthnAuthenticate,
	webauthnIsConfigured,
	webauthnRegister,
	webauthnRemoveCredentials,
} from "$lib/api";
import { userInfoStore } from "$lib/user_info";
import { onMount } from "svelte";
import { get } from "svelte/store";
import ErrorMessage from "../../components/ErrorMessage.svelte";
import { Check } from "@lucide/svelte";

let isWebauthnConfigured = $state(false);
let errorMessage: string | null = $state(null);
let successMessage: string = $state("Passkey configured properly");

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

onMount(async () => {
	isWebauthnConfigured = await webauthnIsConfigured();
});
</script>

<div class="p-3">
  <h2>Configure Account</h2>

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
</div>
