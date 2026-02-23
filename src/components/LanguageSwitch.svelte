<script lang="ts">
  import { _, locale, locales } from "svelte-i18n";
  import {onMount} from "svelte";

  const STORAGE_KEY = "preferred_language";

  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && $locales.includes(saved)) {
      locale.set(saved);
    }
  });

  $: current = ($locale ?? "en").toLowerCase();
  $: short = current.substring(0, 2);

  function toggle() {
    const currentIndex = $locales.indexOf(short);
    const next = $locales[(currentIndex + 1) % $locales.length];
    locale.set(next);
    localStorage.setItem(STORAGE_KEY, next);
  }
</script>

<button
        type="button"
        class="btn btn-ghost text-base"
        on:click={toggle}
        aria-label={$_("account.switchLanguage")}
>
  {short.toUpperCase()}
</button>