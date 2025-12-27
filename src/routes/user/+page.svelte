<script lang="ts">
    import { createUser } from "$lib/api";
    let name: string = $state("");
    let passwort: string = $state("");
    let email: string = $state("");


    async function screateUser() {
        createUser(name, email, passwort)
    }

</script>

<h1>Create User</h1>

<form id="user-submit" onsubmit={screateUser}>
    <input type="text" bind:value={name} placeholder="Name" >
    <input type="text" bind:value={passwort} placeholder="passwort" >
    <input type="text" bind:value={email} placeholder="Email" >
    <input type="submit" value="Create">
</form>

<style>
    #user-submit {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        * {
            width: min-content;
        }
    }
</style>
