import { error } from "@sveltejs/kit";
import { getObjective } from "$lib/api";
import type { Objective } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	try {
		const objective: Objective = await getObjective(params.objectiveID);
		return {
			objectiveID: objective.id,
			objectiveName: objective.name,
		};
	} catch (_) {
		throw error(404, "Not found");
	}
};
