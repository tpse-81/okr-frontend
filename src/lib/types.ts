export interface Project {
	id: string;
	name: string;
	creation_date: Date;
	deadline: Date;
	done: boolean;
	icon?: string | null;
}

export interface Objective {
	id: string;
	name: string;
	description: string;
	parent_id: string;
}

export interface KeyResult {
	id: string;
	projectID: string;
	description: string;
	startValue: number;
	endValue: number;
}

export type TaskState =
	| "open"
	| "planned"
	| "in_progress"
	| "done"
	| "cancelled";

export interface Task {
	id: string;
	description: string;
	task_state: TaskState;
	key_result_id: string;
}
