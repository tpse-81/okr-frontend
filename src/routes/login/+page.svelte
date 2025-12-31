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

<h1>Login</h1>
<form id="login-submit" onsubmit={login}>
  <input type="text" bind:value={username} placeholder="Username" >
  <input type="password" bind:value={password} placeholder="Password" >
  <fieldset class="grid">
    <input type="reset" value="Clear" class="outline">
    <input type="submit" value="Login">
  </fieldset>
</form>

<p>{ token }</p>
