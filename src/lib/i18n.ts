import { getLocaleFromNavigator, init, register } from "svelte-i18n";
import { browser } from "$app/environment";

export const LANGUAGE_STORAGE_KEY = "preferred_language";

register("en", () => import("./i18n/locales/en.json"));
register("de", () => import("./i18n/locales/de.json"));

const savedLocale = browser ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;

init({
	fallbackLocale: "en",
	initialLocale: savedLocale ?? getLocaleFromNavigator(),
});
