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

<form id="login-submit" onsubmit={login}>
  <input type="text" id="username" bind:value={username} placeholder={$_('username')} >
  <input type="password" id="password" bind:value={password} placeholder={$_('password')} >
  <input type="submit" value={$_('login')}>
</form>

<style>
  #login-submit {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    * {
      width: min-content;
    }
  }
</style>

