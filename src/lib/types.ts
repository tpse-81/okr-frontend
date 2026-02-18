export interface Project {
	id: string;
	name: string;
	creation_date: Date;
	deadline: Date;
	done: boolean;
	icon?: string | null;
}

export interface ProjectContainer {
	project: Project;
	objectives: Objective[];
	progress: number;
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
	start_value: number;
	current_value: number;
	end_value: number;
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

export interface User {
	id: string;
	name: string;
	email: string;
	is_admin: boolean;
	must_change_password: boolean;
}

export interface TwoFaRequiredResponse {
	type: "webauthn" | "totp";
	user_id: string;
}

export type ProjectRole = "leader" | "member";
