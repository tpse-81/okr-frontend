import { getLocaleFromNavigator, init, register } from "svelte-i18n";
import { browser } from "$app/environment";

register("en", () => import("./i18n/locales/en.json"));
register("de", () => import("./i18n/locales/de.json"));

const savedLocale = browser ? localStorage.getItem("preferred_language") : null;

init({
	fallbackLocale: "en",
	initialLocale: savedLocale ?? getLocaleFromNavigator(),
});