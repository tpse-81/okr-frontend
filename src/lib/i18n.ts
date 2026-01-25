import { browser } from '$app/environment';
import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';

register('en', () => import('../translations/en.json'));
register('de', () => import('../translations/de.json'));

init({
  fallbackLocale: 'en',
  initialLocale: 'en'
});

if (browser) {
  locale.set(getLocaleFromNavigator() ?? 'en');
}
