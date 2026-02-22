<script lang="ts">
import { _, locale, locales } from "svelte-i18n";

$: current = ($locale ?? "en").toLowerCase();
$: short = current.substring(0, 2);

function toggle() {
	const currentIndex = $locales.indexOf(short);
	locale.set($locales[(currentIndex + 1) % $locales.length]);
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
