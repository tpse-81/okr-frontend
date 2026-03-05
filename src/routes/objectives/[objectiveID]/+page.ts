import { error } from "@sveltejs/kit";
import { getObjective } from "$lib/api";
import type { Objective } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		const objective: Objective = await getObjective(params.objectiveID, fetch);
		return {
			objective: objective,
		};
	} catch (_) {
		throw error(404, "Not found");
	}
};
