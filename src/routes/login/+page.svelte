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

<div class="window">
  <div class="title-bar">
    <div class="title-bar-text">Login</div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize"></button>
      <button aria-label="Close"></button>
    </div>
  </div>
  <form id="login-submit" class="window-body" onsubmit={login}>
    <input type="text" bind:value={username} placeholder="Username" >
    <input type="password" bind:value={password} placeholder="Password" >
    <input type="submit" value="Login">
  </form>
</div>

<p>{ token }</p>

<style>
.window {
  max-width: 200px;
  margin: 0 auto;
}
  
#login-submit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>

