import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import {getObjectives} from '$lib/api';
import type { Objective } from "$lib/types";

export const load: PageLoad = async ({ params }) => {
    const objectiveList: Objective[] = await getObjectives();
    const objective = objectiveList.find(
        (objective: Objective) => objective.id === params.objectiveID // oder params.objective, je nach Route
    );

    if (!objective) {
        throw error(404, 'Not found');
    }
    return { objectiveID: objective.id, objectiveName: objective.name, parentID: objective.parent_id};
};