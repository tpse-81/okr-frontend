import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "e2e",

	use: {
		baseURL: "http://127.0.0.1:4173",
		screenshot: "only-on-failure",
		trace: "on-first-retry",
		video: "retain-on-failure",
	},

	webServer: {
		command: "pnpm run build && pnpm run preview:ci",
		url: "http://127.0.0.1:4173",
	},
});
