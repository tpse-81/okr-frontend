<script lang="ts">
import { EllipsisIcon, MenuIcon, Moon, Sun, X } from "@lucide/svelte";
import arrow from "$lib/assets/arrow-in-the-target.svg";
import "../app.css";
import "$lib/i18n";
import { onMount } from "svelte";
import { _, waitLocale } from "svelte-i18n";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { logout } from "$lib/api";
import {
	restoreUserInfoFromStorage,
	setUserInfo,
	userInfoStore,
} from "$lib/user_info";
import ForcePasswordChangeDialog from "../components/ForcePasswordChangeDialog.svelte";
import LanguageSwitch from "../components/LanguageSwitch.svelte";

const i18nReady = waitLocale();

let { children } = $props();
let title = "OKR Project";
let isDark = $state(false);

//if we ever want some paths to be accessible without being logged in we can put them here (help page for example)
const excludedPaths = ["/login"];

const passwordChangeRequired = $derived(
	Boolean($userInfoStore?.must_change_password),
);

let forcePwDialogOpen = $state(false);

$effect(() => {
	forcePwDialogOpen = Boolean($userInfoStore?.must_change_password);
});

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
}

function getInitialTheme(): string {
	const saved = localStorage.getItem("theme");
	if (saved) return saved;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "luxury"
		: "cupcake";
}

function changeTheme() {
	const theme = isDark ? "luxury" : "cupcake";
	localStorage.setItem("theme", theme);
	applyTheme(theme);
}
</script>

<svelte:head>
  <link rel="icon" href={arrow} />
  <title>{title}</title>
</svelte:head>


{#await i18nReady}
  <div class="p-4">Loading…</div>
{:then}
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
          	<li><a href="/login">{$_("nav.login")}</a></li>

        	{/if}

        	<!-- sections to only show if logged in -->
          {#if $userInfoStore}
            {#if passwordChangeRequired}
              <li><a href="/account">{$_("account.title")}</a></li>
            {:else}
              <li><a href="/dashboard">{$_("dashboard.title")}</a></li>
              <li><a href="/projects">{$_("projects.title")}</a></li>
              <li><a href="/objectives">{$_("objectives.title")}</a></li>
              <li><a href="/key_results">{$_("keyResults.title")}</a></li>
              <li><a href="/tasks">{$_("tasks.title")}</a></li>

              <!-- visually separated admin section -->
              {#if $userInfoStore?.is_admin}
                <div class="divider divider-error mt-4"></div>
                <li>
                  <a href="/user" class="text-error flex items-center justify-between">
                    <span>{$_("users.title")}</span>
                    <span class="badge badge-error badge-sm">{$_("users.admin")}</span>
                  </a>
                </li>
              {/if}
            {/if}
          {/if}
        </ul>
      </div>
    </div>
  </div>

  <a href="/">
    <img
            src={arrow}
            alt="Arrow Logo"
            class="h-8 w-8 ml-3 transition-colors duration-200"
            class:filter-dark={isDark}
    />
  </a>

  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="/">OKR-ng</a>
  </div>

  <!-- button with more options, e.g. logout -->
  {#if $userInfoStore}
    <div class="btn btn-ghost text-base pointer-events-none">
        { $userInfoStore?.name ?? "" }
    </div>

    <div class="ml-2">
    <label class="swap swap-rotate">
      <!-- this hidden checkbox controls the state -->
      <input
              type="checkbox"
              class="theme-controller"
              bind:checked={isDark}
              onchange={changeTheme}
      />

      <!-- sun icon -->
      <Sun class="swap-off h-6.5 w-6.5" />
      <!-- moon icon -->
      <Moon class="swap-on h-6.5 w-6.5"/>
    </label>
    </div>

    <!-- language toggle button-->
    <div class="ml-2">
      <LanguageSwitch />
    </div>
    
    <!-- button with more options, e.g. logout -->
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-square btn-ghost m-1">
        <EllipsisIcon />
      </div>
      <ul tabindex="-1" class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm">
        <li class="btn btn-ghost" onclick={() => goto("/account")}>{$_("nav.account")}</li>
        <li class="btn btn-ghost" onclick={logoutUser}>{$_("nav.logout")}</li>
      </ul>
    </div>
  {/if}
</div>

{@render children()}

{#if $userInfoStore}
	<ForcePasswordChangeDialog
		open={forcePwDialogOpen}
		userInfo={$userInfoStore}
		ondismiss={() => (forcePwDialogOpen = false)}
	/>
{/if}

{/await}

<style>
  .filter-dark{
      filter: invert(78%) sepia(43%) saturate(718%) hue-rotate(335deg) brightness(90%) contrast(91%);
  }
</style>
