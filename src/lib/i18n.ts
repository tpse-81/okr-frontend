import { getLocaleFromNavigator, init, locale, register } from "svelte-i18n";
import { browser } from "$app/environment";

register("en", () => import("../translations/en.json"));
register("de", () => import("../translations/de.json"));

init({
	fallbackLocale: "en",
	initialLocale: "en",
});

if (browser) {
	locale.set(getLocaleFromNavigator());
}
