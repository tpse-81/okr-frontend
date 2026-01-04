<script lang="ts">
import { loginUser } from "$lib";
import { goto } from "$app/navigation";
import { _ } from 'svelte-i18n'

let username: string = $state("");
let password: string = $state("");
let token: string = $state("");

async function login() {
    if (username == "" || password == "") {
      alert("Empty username or password.")
      return;
    };

    // Todo: Error handling missing for wrong username / PW
    token = await loginUser(username, password);

    // redirect to main page
    goto("/");
}
</script>

<form id="login-submit" onsubmit={login}>
  <input type="text" id="username" bind:value={username} placeholder={$_('username')} >
  <input type="password" id="password" bind:value={password} placeholder={$_('password')} >
  <input type="submit" value={$_('login')}>
</form>

<p>{ token }</p>

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

