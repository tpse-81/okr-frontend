// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
	use: {
		baseURL: "http://localhost:4173",
		screenshot: "only-on-failure",
		trace: "on-first-retry",
		video: "retain-on-failure",
	},
	webServer: {
		command: "pnpm run build && pnpm run preview:ci",
		url: "http://localhost:4173",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
