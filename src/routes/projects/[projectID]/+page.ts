import { error } from "@sveltejs/kit";
import { getProject } from "$lib/api";
import type { Project } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		const project: Project = await getProject(params.projectID, fetch);
		return {
			project_id: project.id,
			project_name: project.name,
			project_icon: project.icon,
		};
	} catch (_) {
		throw error(404, "Not found");
	}
};
