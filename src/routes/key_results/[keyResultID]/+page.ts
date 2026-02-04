import { error } from "@sveltejs/kit";
import { getKeyResult } from "$lib/api";
import type { KeyResult } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	try {
		const keyResult: KeyResult = await getKeyResult(params.keyResultID);
		return { keyResultID: keyResult.id };
	} catch (_) {
		throw error(404, "Not found");
	}
};
