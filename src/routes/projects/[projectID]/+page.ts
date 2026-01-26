import { error } from "@sveltejs/kit";
import { getProjects } from "$lib/api";
import type { Project } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	const projectsList: Project[] = await getProjects();

	const project = projectsList.find(
		(project: Project) => project.id === params.projectID,
	);

	if (!project) {
		throw error(404, "Not found");
	}

	return {
		project_id: project.id,
		project_name: project.name,
		project_icon: project.icon,
	};
};
