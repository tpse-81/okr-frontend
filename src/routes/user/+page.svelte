<script lang="ts">
import { createUser } from "$lib/api";
let name: string = $state("");
let passwort: string = $state("");
let email: string = $state("");
import { _ } from "svelte-i18n";

async function screateUser() {
	createUser(name, email, passwort);
}
</script>


<h1>Create User</h1>
<form id="user-submit" onsubmit={screateUser} class="flex gap-3 p-3 m-auto">
    <input type="text" bind:value={name} placeholder={$_('username')} class="input w-full">
    <input type="text" bind:value={passwort} placeholder={$_('password')} class="input w-full">
    <input type="text" bind:value={email} placeholder={$_('email')} class="input w-full">
    <input type="submit" value="Create" class="btn btn-primary">
</form>
