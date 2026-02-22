import { getLocaleFromNavigator, init, locale, register } from "svelte-i18n";
import { browser } from "$app/environment";

register("en", () => import("./i18n/locales/en.json"));
register("de", () => import("./i18n/locales/de.json"));

init({
	fallbackLocale: "en",
	initialLocale: "en",
});

if (browser) {
	locale.set(getLocaleFromNavigator());
}
