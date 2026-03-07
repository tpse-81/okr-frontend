export interface Project {
	id: string;
	name: string;
	creation_date: Date;
	deadline: Date;
	done: boolean;
	icon?: string | null;
	is_archived?: boolean;
	archive_reason?: ArchiveReason | null;
}

export type ArchiveReason = "on_break" | "finalized" | "give_up";

export interface Dashboard {
	projects: ProjectContainer[];
	tasks: Task[];
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
	is_archived?: boolean;
}

export interface KeyResult {
	id: string;
	projectID: string;
	description: string;
	start_value: number;
	current_value: number;
	end_value: number;
	is_archived?: boolean;
}

export type TaskState =
	| "open"
	| "planned"
	| "in_progress"
	| "done"
	| "cancelled";

export interface Task {
	id: string;
	name: string;
	description: string;
	task_state: TaskState;
	key_result_id: string;
	is_archived?: boolean;
}

export interface User {
	id: string;
	name: string;
	email: string;
	is_admin: boolean;
	must_change_password: boolean;
}

export interface TwoFaRequiredResponse {
	user_id: string;
	totp_supported: boolean;
	webauthn_supported: boolean;
}

export type ProjectRole = "leader" | "member";

export const taskStates: { state: TaskState; label: string; badge: string }[] =
	[
		{ state: "open", label: "tasks.open", badge: "badge-ghost" },
		{ state: "planned", label: "tasks.planned", badge: "badge-warning" },
		{ state: "in_progress", label: "tasks.in_progress", badge: "badge-info" },
		{ state: "done", label: "tasks.done", badge: "badge-success" },
		{ state: "cancelled", label: "tasks.cancelled", badge: "badge-error" },
	];

export function taskStateIndex(category: TaskState) {
	return taskStates.findIndex((state) => state.state === category);
}
