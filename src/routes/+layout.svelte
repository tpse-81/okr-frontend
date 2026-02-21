<script lang="ts">
import { EllipsisIcon, MenuIcon, Moon, Sun, X } from "@lucide/svelte";
import favicon from "$lib/assets/favicon.svg";
import "../app.css";
import "$lib/i18n";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { logout } from "$lib/api";
import {
	restoreUserInfoFromStorage,
	setUserInfo,
	userInfoStore,
} from "$lib/user_info";

let { children } = $props();
let title = "OKR Project";
let isDark = $state(false);
let checkbox: HTMLInputElement;

//if we ever want some paths to be accessible without being logged in we can put them here (help page for example)
const excludedPaths = ["/login"];

async function logoutUser() {
	try {
		await logout();
	} catch {
		// ignore errors on logout response - probably caused by the fact that the user's token has expired already
	}

	setUserInfo(null);
	await goto("/login");
}

// run in onMount to ensure that it's run on client side (i.e. window is available)
let userInfoLoaded = false;

onMount(async () => {
	restoreUserInfoFromStorage();
	userInfoLoaded = true;

	const theme = getInitialTheme();
	applyTheme(theme);
	isDark = theme === "luxury";
});

$effect(() => {
	const path = page.url.pathname;
	if (
		userInfoLoaded &&
		$userInfoStore == null &&
		!excludedPaths.includes(path)
	) {
		goto("/login");
	}
});

function applyTheme(theme: string) {
	document.documentElement.setAttribute("data-theme", theme);
	if (checkbox) checkbox.checked = theme === "luxury";
}

function getInitialTheme(): string {
	const saved = localStorage.getItem("theme");
	if (saved) return saved;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "luxury"
		: "cupcake";
}

function changeTheme() {
	const theme = checkbox.checked ? "luxury" : "cupcake";
	localStorage.setItem("theme", theme);
	applyTheme(theme);
}
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>{title}</title>
</svelte:head>

<div class="navbar bg-base-100 shadow-sm">
  <div class="drawer w-auto">
    <!-- uses the CSS checkbox hack, see https://daisyui.com/components/drawer/ -->
    <input id="navigation-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <!-- Actual content of the button used for toggling the drawer -->
      <label id="navigation-drawer-toggle" for="navigation-drawer" class="btn btn-square btn-ghost">
        <MenuIcon />
      </label>
    </div>
    <div class="drawer-side">
      <!-- close drawer on click outside (i.e. click on this drawer-overlay label) -->
      <label id="navigation-drawer-overlay" for="navigation-drawer" aria-label="close sidebar" class="drawer-overlay"></label>

      <div class="bg-base-200 min-h-full w-80 p-4 flex flex-col">
        <!-- button to manually close the navigation drawer -->
        <label
          for="navigation-drawer"
          aria-label="close sidebar"
          class="btn btn-ghost w-min self-end"
        >
          <X />
        </label>

        <ul class="menu w-full">
        	<!-- sections to only show if not logged in -->
        	{#if $userInfoStore == null}
          	<li><a href="/login">Login</a></li>
        	{/if}
        	<!-- sections to only show if logged in -->
        	{#if $userInfoStore}
            <li><a href="/dashboard">Dashboard</a></li>
          	<li><a href="/projects">Projects</a></li>
          	<li><a href="/objectives">Objectives</a></li>
          	<li><a href="/key_results">Key results</a></li>
            <li><a href="/tasks">Tasks</a></li>
            <!-- visually separated admin section -->
            {#if $userInfoStore?.is_admin}
              <div class="divider divider-error mt-4"></div>
              <li><a href="/user" class="text-error flex items-center justify-between"><span>Manage users</span><span class="badge badge-error badge-sm">Admin</span></a></li>
            {/if}
          {/if}
        </ul>
      </div>
    </div>
  </div>

  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="/">OKR-ng</a>
  </div>

  <!-- button with more options, e.g. logout -->
  {#if $userInfoStore}
    <div>
        { $userInfoStore?.name ?? "" }
    </div>

    <div class="ml-2">
    <label class="swap swap-rotate">
      <!-- this hidden checkbox controls the state -->
      <input type="checkbox" class="theme-controller" value="luxury" bind:this={checkbox} onchange={changeTheme} checked={isDark}/>

      <!-- sun icon -->
      <Sun class="swap-off h-6.5 w-6.5" />
      <!-- moon icon -->
      <Moon class="swap-on h-6.5 w-6.5"/>
    </label>
    </div>

    <!-- button with more options, e.g. logout -->
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-square btn-ghost m-1">
        <EllipsisIcon />
      </div>
      <ul tabindex="-1" class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm">
        <li class="btn btn-ghost" onclick={() => goto("/account")}>Account</li>
        <li class="btn btn-ghost" onclick={logoutUser}>Logout</li>
      </ul>
    </div>
  {/if}
</div>

{@render children()}

