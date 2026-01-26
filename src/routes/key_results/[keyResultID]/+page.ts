import { error } from "@sveltejs/kit";
import { getKeyResults } from "$lib/api";
import type { KeyResult } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	const keyResultList: KeyResult[] = await getKeyResults();
	const keyResult = keyResultList.find(
		(keyResult: KeyResult) => keyResult.id === params.keyResultID, // oder params.objective, je nach Route
	);

	if (!keyResult) {
		throw error(404, "Not found");
	}
	return { keyResultID: keyResult.id };
};
