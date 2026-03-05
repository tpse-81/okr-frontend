// load api url from .env file or runtime environment if provided
import { goto } from "$app/navigation";
import { env } from "$env/dynamic/public";

const PUBLIC_API_URL = env.PUBLIC_API_URL;
export const AUTH_TOKEN_NAME = "token";

import type {
	ArchiveReason,
	Dashboard,
	KeyResult,
	Objective,
	Project,
	Task,
	TaskState,
} from "$lib/types";
import { setUserInfo } from "./user_info";

export class APIError extends Error {
	status: number;
	response: Response;

	constructor(response: Response) {
		super(response.statusText);
		this.name = "APIError";
		this.status = response.status;
		this.response = response;
	}
}

type FetchMethod = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

/**
 * Fetch data from the API.
 *
 * If there is a chance that this code is executed on server-side, the custom `fetch`-method
 * from the `load` method in `+page.server.ts` MUST be passed here.
 **/
const baseFetch = async (
	url: string,
	options: RequestInit = {},
	customFetch: FetchMethod | null = null,
) => {
	// this is required for server-side loading of application data -
	// if a server-side fetch method is provided, we have to use this one instead
	// this ensures that auth tokens are sent properly, otherwise the server side
	// request would omit this data, causing the API to return a Forbidden error
	const fetchMethod = customFetch ?? fetch;

	const response = await fetchMethod(`${PUBLIC_API_URL}${url}`, {
		credentials: "include",
		...options,
		headers: {
			"Content-Type": "application/json",
			...(options.headers ?? {}),
		},
	});

	// user is unauthorized - this likely happened because the auth token expired
	// -> clear stored user data, redirect to login page
	if (response.status === 401) {
		setUserInfo(null);
		await goto("/login");
	}

	// custom error handler that parses the Litestar JSON error format
	if (!response.ok) {
		throw new APIError(response);
	}

	return response;
};

async function readErrorMessage(response: Response): Promise<string> {
	try {
		const data = await response.json();
		return data?.detail ?? data?.message ?? JSON.stringify(data);
	} catch {
		return response.statusText || `HTTP ${response.status}`;
	}
}

export async function createUser(
	name: string,
	email: string,
	password: string,
) {
	const response = await baseFetch("/users/create", {
		method: "POST",
		body: JSON.stringify({ name, email, password }),
	});

	if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
	return response.json();
}

export async function getProjectPermission(project_id: string) {
	const response = await baseFetch(`/projects/${project_id}/permissions`, {
		method: "GET",
	});
	return response.json();
}

export async function getObjectivePermission(objective_id: string) {
	const response = await baseFetch(`/objectives/${objective_id}/permissions`, {
		method: "GET",
	});
	return response.json();
}

export async function getKeyResultPermission(key_result_id: string) {
	const response = await baseFetch(
		`/key_results/${key_result_id}/permissions`,
		{
			method: "GET",
		},
	);
	return response.json();
}

export async function getTaskPermission(task_id: string) {
	const response = await baseFetch(`/tasks/${task_id}/permissions`, {
		method: "GET",
	});
	return response.json();
}

export async function promoteUser(user_id: string) {
	const response = await baseFetch(`/users/${user_id}/promote`, {
		method: "PATCH",
	});

	return response.json();
}

export async function loginUser(
	username: string,
	password: string,
	two_fa_code: string | null,
	authenticationResponse: Credential | null,
) {
	const response = await baseFetch("/login", {
		method: "POST",
		body: JSON.stringify({
			name: username,
			password: password,
			two_fa_code: two_fa_code,
			webauthn_response: authenticationResponse,
		}),
	});

	return response.json();
}

export async function deleteUser(userId: string): Promise<void> {
	const response = await baseFetch(`/users/${userId}`, { method: "DELETE" });
	if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
}

export async function changeUserPassword(
	oldPassword: string,
	newPassword: string,
): Promise<{ message: string }> {
	const response = await baseFetch(`/users/password/change`, {
		method: "PATCH",
		body: JSON.stringify({
			old_password: oldPassword,
			new_password: newPassword,
		}),
	});
	if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
	return response.json();
}

export async function resetUserPassword(
	userId: string,
	newPassword: string,
): Promise<{ message: string }> {
	const response = await baseFetch(`/users/${userId}/password/reset`, {
		method: "PATCH",
		body: JSON.stringify({
			new_password: newPassword,
		}),
	});
	if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
	return response.json();
}

export async function logout() {
	await baseFetch(`/logout`, {
		method: "POST",
	});
}

export async function getUsers() {
	const response = await baseFetch("/users");

	if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

	return response.json();
}

export async function getTasksForUser(userId: string): Promise<Task[]> {
	const response = await baseFetch(`/users/${userId}/tasks`);
	return response.json();
}

export async function getFileBytes(file: File) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
	});
}

export async function createProject(
	name: string,
	deadline: Date,
	imageInput: string | null,
) {
	const response = await baseFetch("/projects", {
		method: "POST",
		body: JSON.stringify({
			name: name,
			deadline: deadline.toISOString(),
			done: false,
			icon: imageInput,
		}),
	});

	return response;
}

export async function getProject(
	project_id: string,
	customFetch: FetchMethod | null = null,
): Promise<Project> {
	const response = await baseFetch(`/projects/${project_id}`, {}, customFetch);

	return response.json();
}

export async function updateProject(project: Project): Promise<Project> {
	const response = await baseFetch(`/projects/${project.id}`, {
		method: "PATCH",
		body: JSON.stringify(project),
	});

	return response.json();
}

export async function deleteProject(project_id: string) {
	const response = await baseFetch(`/projects/${project_id}`, {
		method: "DELETE",
	});

	return response.ok;
}

export async function getProjects() {
	const response = await baseFetch("/projects");

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response.json();
}

export async function getArchivedProjects() {
	const response = await baseFetch("/projects/archived");

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response.json();
}

export async function archiveProject(
	projectId: string,
	reason: ArchiveReason,
): Promise<{ message: string }> {
	const response = await baseFetch(
		`/projects/${projectId}/archive?archive_reason=${reason}`,
		{ method: "PATCH" },
	);

	return response.json();
}

export async function unarchiveProject(
	projectId: string,
	newDeadline: Date,
): Promise<{ message: string }> {
	const deadlineParam = encodeURIComponent(newDeadline.toISOString());
	const response = await baseFetch(
		`/projects/${projectId}/unarchive?new_deadline=${deadlineParam}`,
		{ method: "PATCH" },
	);

	return response.json();
}

export async function getProjectsForUser(userID: string) {
	const response = await baseFetch(`/users/${userID}/projects`);

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response.json();
}

export async function getProjectById(projectId: string): Promise<Project> {
	const response = await baseFetch(`/projects/${projectId}`);

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}
	return response.json();
}

export async function createObjective(
	name: string,
	description: string,
	project_id: string,
) {
	const response = await baseFetch(`/projects/${project_id}/objectives`, {
		method: "POST",
		body: JSON.stringify({ name, description }),
	});

	return response;
}

export async function getObjective(
	objective_id: string,
	customFetch: FetchMethod | null = null,
): Promise<Objective> {
	const response = await baseFetch(
		`/objectives/${objective_id}`,
		{},
		customFetch,
	);

	return response.json();
}

export async function getProjectsForObjective(
	objective_id: string,
): Promise<Project[]> {
	const response = await baseFetch(`/objectives/${objective_id}/projects`);

	return response.json();
}

export async function updateObjective(
	objective: Objective,
): Promise<Objective> {
	const response = await baseFetch(`/objectives/${objective.id}`, {
		method: "PATCH",
		body: JSON.stringify(objective),
	});

	return await response.json();
}

export async function deleteObjective(objective_id: string) {
	const response = await baseFetch(`/objectives/${objective_id}`, {
		method: "DELETE",
	});

	return response.ok;
}

export async function getObjectives() {
	const response = await baseFetch("/objectives");

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}
	return response.json();
}

export async function getArchivedObjectives() {
	const response = await baseFetch("/objectives/archived");

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response.json();
}

export async function getObjectiveProject(project_id: string) {
	const response = await baseFetch(`/projects/${project_id}/objectives`);

	return response.json();
}

export async function linkObjectiveToProject(
	project_id: string,
	objective_id: string,
) {
	const response = await baseFetch(
		`/projects/${project_id}/objectives/${objective_id}`,
		{
			method: "POST",
		},
	);

	return response.json();
}

export async function unlinkObjectiveFromProject(
	project_id: string,
	objective_id: string,
	confirm_orphan = false,
) {
	const response = await baseFetch(
		`/projects/${project_id}/objectives/${objective_id}?confirm_orphan=${confirm_orphan}`,
		{
			method: "DELETE",
		},
	);

	const text = await response.text();
	return text ? JSON.parse(text) : null;
}

export async function linkObjectiveToObjective(
	parent_objective_id: string,
	objective_id: string,
) {
	const response = await baseFetch(
		`/objectives/${parent_objective_id}/children/${objective_id}`,
		{
			method: "POST",
		},
	);

	if (!response.ok) {
		let body: any = null;
		try {
			body = await response.json();
		} catch {
			// ignore, fallback below
		}
		if (body && typeof body === "object") {
			throw { ...body, status: response.status };
		}
		throw { detail: body ?? response.statusText, status: response.status };
	}

	return response.json();
}

export async function unlinkObjectiveFromObjective(
	parent_objective_id: string,
	objective_id: string,
) {
	const response = await baseFetch(
		`/objectives/${parent_objective_id}/children/${objective_id}`,
		{
			method: "DELETE",
		},
	);

	const text = await response.text();
	return text ? JSON.parse(text) : null;
}

export async function getObjectiveChildren(
	objective_id: string,
): Promise<Objective[]> {
	const response = await baseFetch(`/objectives/${objective_id}/children`);
	return response.json();
}

export async function createKeyResult(
	description: string,
	end_value: number,
	start_value: number,
	objective_id: string,
) {
	const response = await baseFetch(`/objectives/${objective_id}/key_results`, {
		method: "POST",
		body: JSON.stringify({
			description,
			start_value,
			end_value,
		}),
	});
	return response.json();
}

export async function getKeyResult(
	key_result_id: string,
	customFetch: FetchMethod | null = null,
): Promise<KeyResult> {
	const response = await baseFetch(
		`/key_results/${key_result_id}`,
		{},
		customFetch,
	);

	return response.json();
}

export async function getObjectiveForKeyResult(
	key_result_id: string,
): Promise<Objective> {
	const response = await baseFetch(`/key_results/${key_result_id}/objective`);

	return response.json();
}

export async function getArchivedKeyResults() {
	const response = await baseFetch("/key_results/archived");
	return response.json();
}

export async function updateKeyResult(
	keyResult: KeyResult,
): Promise<KeyResult> {
	const response = await baseFetch(`/key_results/${keyResult.id}`, {
		method: "PATCH",
		body: JSON.stringify(keyResult),
	});

	return response.json();
}

export async function getDashboard(
	user_id: string | null = null,
): Promise<Dashboard> {
	const response = await baseFetch(
		user_id ? `/dashboard?user_id=${user_id}` : "/dashboard",
	);
	return response.json();
}

export async function updateKeyResultCurrentValue(
	keyResultId: string,
	currentValue: number,
): Promise<KeyResult> {
	const response = await baseFetch(`/key_results/${keyResultId}/current`, {
		method: "PATCH",
		body: JSON.stringify({ current_value: currentValue }),
	});
	return await response.json();
}

export async function deleteKeyResult(key_result_id: string) {
	const response = await baseFetch(`/key_results/${key_result_id}`, {
		method: "DELETE",
	});

	return response.ok;
}

export async function getKeyResults() {
	const response = await baseFetch("/key_results");

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}
	return response.json();
}

export async function getKeyResultObjective(objective_id: string) {
	const response = await baseFetch(`/objectives/${objective_id}/key_results`);

	return response.json();
}

export async function createTaskKeyResult(
	key_result_id: string,
	name: string,
	description: string,
	task_state: TaskState,
) {
	const response = await baseFetch(`/key_results/${key_result_id}/tasks`, {
		method: "POST",
		body: JSON.stringify({
			name,
			description: description,
			task_state: task_state,
		}),
	});

	return response;
}

export async function getTask(task_id: string): Promise<Task> {
	const response = await baseFetch(`/tasks/${task_id}`);

	return response.json();
}

export async function getKeyResultForTask(task_id: string): Promise<KeyResult> {
	const response = await baseFetch(`/tasks/${task_id}/key_result`);

	return response.json();
}

export async function updateTask(task: Task): Promise<Task> {
	const response = await baseFetch(`/tasks/${task.id}`, {
		method: "PATCH",
		body: JSON.stringify(task),
	});

	return response.json();
}

export async function getTasks(): Promise<Task[]> {
	const response = await baseFetch("/tasks");
	return response.json();
}

export async function getArchivedTasks() {
	const response = await baseFetch("/tasks/archived");
	return response.json();
}

export async function deleteTask(task_id: string) {
	const response = await baseFetch(`/tasks/${task_id}`, {
		method: "DELETE",
	});

	return response.ok;
}

export async function getTasksKeyResult(key_result_id: string) {
	const response = await baseFetch(`/key_results/${key_result_id}/tasks`);

	return response.json();
}

export async function addUserProject(
	project_id: string,
	user_id: string,
	role: string,
) {
	const response = await baseFetch(
		`/projects/${project_id}/users/${user_id}?role=${role}`,
		{
			method: "POST",
		},
	);
	return response.json();
}

export async function removeUserProject(project_id: string, user_id: string) {
	const response = await baseFetch(`/projects/${project_id}/users/${user_id}`, {
		method: "DELETE",
	});
	return response.json();
}

export async function updateUserRoleProject(
	project_id: string,
	user_id: string,
	role: string,
) {
	const response = await baseFetch(
		`/projects/${project_id}/users/${user_id}/role?role=${role}`,
		{ method: "PATCH" },
	);
	return response.json();
}

export async function getUserRoleProject(project_id: string, user_id: string) {
	const response = await baseFetch(
		`/projects/${project_id}/users/${user_id}/role`,
	);
	return response.json(); // // Returns the user's role in this project (e.g. "member" or "leader").
}

export async function getUsersProject(project_id: string) {
	const response = await baseFetch(`/projects/${project_id}/users`);
	return response.json();
}

export async function addObjectiveProject(
	project_id: string,
	objective_id: string,
) {
	const response = await baseFetch(
		`/projects/${project_id}/objectives/${objective_id}`,
		{
			method: "POST",
		},
	);

	return response.json();
}

export async function getWebauthnRegistrationOptions() {
	const response = await baseFetch(`/webauthn/registration_options`, {
		method: "POST",
	});

	return response.json();
}

export async function webauthnRegister(
	// biome-ignore lint/suspicious: the webauthn-internal response mustn't be parsed, so no type hints needed
	registrationResponse: Record<string, any>,
) {
	const response = await baseFetch(`/webauthn/register`, {
		method: "POST",
		body: JSON.stringify(registrationResponse),
	});

	return response.json();
}

export async function getWebauthnAuthenticationOptions(userId: string) {
	const response = await baseFetch(
		`/webauthn/authentication_options/${userId}`,
		{
			method: "POST",
		},
	);

	return response.json();
}

export async function webauthnAuthenticate(
	userId: string,
	// biome-ignore lint/suspicious: the webauthn-internal response mustn't be parsed, so no type hints needed
	authenticationResponse: Record<string, any>,
) {
	const response = await baseFetch(`/webauthn/authenticate/${userId}`, {
		method: "POST",
		body: JSON.stringify(authenticationResponse),
	});

	return response.json();
}

export async function webauthnRemoveCredentials(
	userId: string,
	// biome-ignore lint/suspicious: the webauthn-internal response mustn't be parsed, so no type hints needed
	authenticationResponse: Record<string, any>,
) {
	await baseFetch(`/webauthn/remove_credentials/${userId}`, {
		method: "DELETE",
		body: JSON.stringify(authenticationResponse),
	});
}

export async function webauthnIsConfigured(): Promise<boolean> {
	const response = await baseFetch(`/webauthn/is_configured`);

	return (await response.json()).is_configured;
}

// --- Account settings ---

export async function changePassword(
	userId: string,
	oldPassword: string,
	newPassword: string,
): Promise<{ message: string }> {
	const response = await baseFetch(`/users/${userId}/password/change`, {
		method: "PATCH",
		body: JSON.stringify({
			old_password: oldPassword,
			new_password: newPassword,
		}),
	});

	return response.json();
}

export type TotpSetupResponse = {
	secret: string;
	otpauth_uri: string;
};

export async function totpSetup(userId: string): Promise<TotpSetupResponse> {
	const response = await baseFetch(`/users/${userId}/2fa/totp/setup`, {
		method: "POST",
	});

	return response.json();
}

export async function totpConfirm(
	userId: string,
	code: string,
): Promise<{ message: string }> {
	const response = await baseFetch(`/users/${userId}/2fa/totp/confirm`, {
		method: "POST",
		body: JSON.stringify({ code }),
	});

	return response.json();
}

export async function totpDisable(
	userId: string,
	code: string,
): Promise<{ message: string }> {
	const response = await baseFetch(`/users/${userId}/2fa/totp/disable`, {
		method: "POST",
		body: JSON.stringify({ code }),
	});

	return response.json();
}

export async function totpIsConfigured(userId: string): Promise<boolean> {
	const response = await baseFetch(`/users/${userId}/2fa/totp/is_configured`);

	return (await response.json()).is_configured;
}

// ---- Project members / user assignment ----

export async function getProjectUsers(projectId: string) {
	const r = await baseFetch(`/projects/${projectId}/users`, { method: "GET" });
	return r.json();
}

export async function getMyRoleInProject(projectId: string, myUserId: string) {
	const r = await baseFetch(`/projects/${projectId}/users/${myUserId}/role`, {
		method: "GET",
	});
	return r.json();
}

export async function addUserToProject(
	projectId: string,
	userId: string,
	role: "member" | "leader" = "member",
) {
	const r = await baseFetch(
		`/projects/${projectId}/users/${userId}?role=${role}`,
		{
			method: "POST",
		},
	);
	return r.json();
}

export async function removeUserFromProject(projectId: string, userId: string) {
	// falls euer Backend wirklich /remove nutzt
	const r = await baseFetch(`/projects/${projectId}/users/${userId}/remove`, {
		method: "POST",
	});
	return r.json();
}

export async function updateUserRoleInProject(
	projectId: string,
	userId: string,
	role: "member" | "leader",
) {
	const r = await baseFetch(
		`/projects/${projectId}/users/${userId}/role?role=${role}`,
		{ method: "PATCH" },
	);
	return r.json();
}

export async function getUserRoleInProject(projectId: string, userId: string) {
	const r = await baseFetch(`/projects/${projectId}/users/${userId}/role`, {
		method: "GET",
	});
	return r.json();
}
