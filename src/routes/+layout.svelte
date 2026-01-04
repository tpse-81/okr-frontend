<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<script context="module">
  	import { waitLocale } from 'svelte-i18n'

	import { getLocaleFromNavigator, init, register, } from 'svelte-i18n';

	register('en', () => import('../translations/en.json'));
	register('de', () => import('../translations/de.json'));

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator()
});
  

  	export async function preload() {
    // awaits for the loading of the 'en-US' and 'en' dictionaries
    return waitLocale()
  }
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
