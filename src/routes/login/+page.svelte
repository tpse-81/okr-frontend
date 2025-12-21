<script lang="ts">
import { loginUser } from "$lib";
import { goto } from "$app/navigation";

let username: string = $state("");
let password: string = $state("");
let token: string = $state("");

async function login() {
    if (username == "" || password == "") {
      alert("Empty username or password.")
      return;
    };

    token = await loginUser(username, password);

    // redirect to main page
    goto("/");
}
</script>

<form id="login-submit" onsubmit={login}>
  <input type="text" bind:value={username} placeholder="Username" >
  <input type="password" bind:value={password} placeholder="Password" >
  <input type="submit" value="Login">
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

