<script lang="ts">
import { loginUser } from "$lib";
import { goto } from "$app/navigation";
import { token } from "$lib/stores";
import { _ } from "svelte-i18n";

let username: string = $state("");
let password: string = $state("");

async function login() {
	if (username === "" || password === "") {
		alert("Empty username or password.");
		return;
	}

	// Todo: Error handling missing for wrong username / PW
	try {
		const authtoken = await loginUser(username, password);
		token.set(authtoken);

		await goto("/");
	} catch (e) {
		console.error(e);
		await goto("/expected");
	}
}
</script>

<div class="h-screen flex align-center">
	<form id="login-submit" onsubmit={login} class="flex flex-col justify-center gap-3 w-8/10 m-auto">
		<h1>Login</h1>
	  <input type="text" id="username" bind:value={username} placeholder={$_('username')} class="input w-full" >
	  <input type="password" id="password" bind:value={password} placeholder={$_('password')} class="input w-full" >
	  <input type="submit" value={$_('login')} class="btn btn-primary">
	</form>
</div>
