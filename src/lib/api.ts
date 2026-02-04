// load api url from .env file
import { PUBLIC_API_URL } from "$env/static/public";
import type {
	KeyResult,
	Objective,
	Project,
	Task,
	TaskState,
} from "$lib/types";

const baseFetch = (url: string, options: RequestInit = {}) => {
	return fetch(`${PUBLIC_API_URL}${url}`, {
		credentials: "include",
		...options,
		headers: {
			"Content-Type": "application/json",
			...(options.headers ?? {}),
		},
	});
};

export async function createUser(
	name: string,
	email: string,
	password: string,
) {
	const response = await baseFetch("/users/create", {
		method: "POST",
		body: JSON.stringify({ name, email, password }),
	});

	return response.json();
}

export async function loginUser(username: string, password: string) {
	const response = await baseFetch("/login", {
		method: "POST",
		body: JSON.stringify({
			email: username,
			password: password,
			two_fa_code: "",
		}),
	});

	return response.json();
}

export async function logout() {
	await fetch(`${PUBLIC_API_URL}/logout`, {
		method: "POST",
		credentials: "include",
	});
}

export async function getUsers() {
	const response = await baseFetch("/users");

	if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

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

export async function getProject(project_id: string): Promise<Project> {
	const response = await baseFetch(`/projects/${project_id}`);

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

export async function getObjective(objective_id: string): Promise<Objective> {
	const response = await baseFetch(`/objectives/${objective_id}`);

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

export async function getObjectiveProject(project_id: string) {
	const response = await baseFetch(`/projects/${project_id}/objectives`);

	return response.json();
}

export async function createKeyResult(
	description: string,
	end_value: number,
	start_value: number,
	objective_id: string,
	project_id: string,
) {
	const response = await baseFetch(`/objectives/${objective_id}/key_results`, {
		method: "POST",
		body: JSON.stringify({
			project_id,
			description,
			start_value,
			end_value,
		}),
	});
	return response.json();
}

export async function getKeyResult(key_result_id: string): Promise<KeyResult> {
	const response = await baseFetch(`/key_results/${key_result_id}`);

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
	description: string,
	task_state: TaskState,
) {
	const response = await baseFetch(`/key_results/${key_result_id}/tasks`, {
		method: "POST",
		body: JSON.stringify({
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

export async function updateTask(task: Task): Promise<Task> {
	const response = await baseFetch(`/tasks/${task.id}`, {
		method: "PATCH",
		body: JSON.stringify(task),
	});

	return response.json();
}

export async function getTasks() {
	const response = await baseFetch("/tasks");
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
