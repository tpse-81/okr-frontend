<script lang="ts">
import { EllipsisIcon, MenuIcon, X } from "@lucide/svelte";
import favicon from "$lib/assets/favicon.svg";
import "../app.css";
import "$lib/i18n";

let { children } = $props();
let title = "OKR Project";
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
      <label for="navigation-drawer" class="btn btn-square btn-ghost">
        <MenuIcon />
      </label>
    </div>
    <div class="drawer-side">
      <!-- close drawer on click outside (i.e. click on this drawer-overlay label) -->
      <label for="navigation-drawer" aria-label="close sidebar" class="drawer-overlay"></label>

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
        	<li><a href="/">Home</a></li>
        	<li><a href="/login">Login</a></li>
        	<li><a href="/user">User</a></li>
        	<li><a href="/projects">Projects</a></li>
        	<li><a href="/objectives">Objectives</a></li>
        	<li><a href="/key_results">Key results</a></li>
          <li><a href="/tasks">Tasks</a></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="/">OKR-ng</a>
  </div>

  <!-- button with more options, e.g. logout -->
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-square btn-ghost m-1">
      <EllipsisIcon />
    </div>
    <ul tabindex="-1" class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm">
      <li class="btn btn-ghost">Logout <!-- TODO: logout actually --></li>
      <li class="btn btn-ghost">Something else</li>
    </ul>
  </div>
</div>

{@render children()}

