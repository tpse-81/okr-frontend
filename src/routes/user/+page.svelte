<script lang="ts">
import { createUser } from "$lib/api";
let name: string = $state("");
let passwort: string = $state("");
let email: string = $state("");

async function screateUser() {
	createUser(name, email, passwort);
}
</script>


<h1>Create User</h1>
<form id="user-submit" onsubmit={screateUser} class="flex gap-3 p-3 m-auto">
    <input type="text" bind:value={name} placeholder="Name" class="input w-full">
    <input type="text" bind:value={passwort} placeholder="passwort" class="input w-full">
    <input type="text" bind:value={email} placeholder="Email" class="input w-full">
    <input type="submit" value="Create" class="btn btn-primary">
</form>
