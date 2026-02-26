import type { HandleFetch } from "@sveltejs/kit";
import { AUTH_TOKEN_NAME } from "$lib/api";

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	// this ensures that all API calls done on the server side also have
	// access to the jwt token required for authentication
	// see https://svelte.dev/docs/kit/hooks#Server-hooks-handleFetch

	const token = event.cookies.get(AUTH_TOKEN_NAME);
	if (token) request.headers.set(AUTH_TOKEN_NAME, token);

	return fetch(request);
};
