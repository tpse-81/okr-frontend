import { get } from "svelte/store";
// load api url from .env file
import { PUBLIC_API_URL } from "$env/static/public";
import type {
	KeyResult,
	Objective,
	Project,
	Task,
	TaskState,
} from "$lib/types";
import {getCookie} from "$lib/utils";


export async function createUser(
	name: string,
	email: string,
	password: string,
) {
	const response = await fetch(`${PUBLIC_API_URL}/users/create`, {
		method: "POST",
		body: JSON.stringify({
			name: name,
			email: email,
			password: password,
		}),
	});
	return response.json();
}

export async function getUsers() {
	const t = getCookie("token") ?? "";
	if (!t) throw new Error("Token ist leer");

	const response = await fetch(`${PUBLIC_API_URL}/users`, {
		method: "GET",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response.json();
}

export async function loginUser(username: string, password: string) {
	const response = await fetch(`${PUBLIC_API_URL}/login`, {
		method: "POST",
		body: JSON.stringify({
			email: username,
			password: password,
			two_fa_code: "",
		}),
		credentials: "include",
	});
	const response_body = await response.json();
	return response_body.jwt_token;
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
	const t = getCookie("token") ?? "";
	const response = await fetch(`${PUBLIC_API_URL}/projects`, {
		method: "POST",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: name,
			deadline: deadline.toISOString(),
			done: false,
			icon: imageInput,
		}),
	});
	console.log(response);

	return response;
}

export async function updateProject(project: Project): Promise<Project> {
	const t = getCookie("token") ?? "";
	const response = await fetch(`${PUBLIC_API_URL}/projects/${project.id}`, {
		method: "PATCH",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(project),
	});

	return await response.json();
}

export async function deleteProject(project_id: string) {
	const t = getCookie("token") ?? "";
	const response = await fetch(`${PUBLIC_API_URL}/projects/${project_id}`, {
		method: "DELETE",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

	return response.ok;
}

export async function getProjects() {
	const t = getCookie("token") ?? "";
	if (!t) throw new Error("Token ist leer");

	const response = await fetch(`${PUBLIC_API_URL}/projects`, {
		method: "GET",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

	console.log("Aktueller Token:", getCookie("token") ?? "");

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response.json();
}

export async function getProjectById(projectId: string): Promise<Project> {
	const t = getCookie("token") ?? "";
	if (!t) throw new Error("Token ist leer");

	const response = await fetch(`${PUBLIC_API_URL}/projects/${projectId}`, {
		method: "GET",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

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
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/projects/${project_id}/objectives`,
		{
			method: "POST",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: name,
				description: description,
			}),
		},
	);

	return response;
}

export async function updateObjective(
	objective: Objective,
): Promise<Objective> {
	const t = getCookie("token") ?? "";
	const response = await fetch(`${PUBLIC_API_URL}/objectives/${objective.id}`, {
		method: "PATCH",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(objective),
	});

	return await response.json();
}

export async function deleteObjective(objective_id: string) {
	const t = getCookie("token") ?? "";
	const response = await fetch(`${PUBLIC_API_URL}/objectives/${objective_id}`, {
		method: "DELETE",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

	return response.ok;
}

export async function getObjectives() {
	const t = getCookie("token") ?? "";

	const response = await fetch(`${PUBLIC_API_URL}/objectives`, {
		method: "GET",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response.json();
}

export async function getObjectiveProject(project_id: string) {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/projects/${project_id}/objectives`,
		{
			method: "GET",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
		},
	);

	return response.json();
}

export async function createKeyResult(
	description: string,
	end_value: number,
	start_value: number,
	objective_id: string,
	project_id: string,
) {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/objectives/${objective_id}/key_results`,
		{
			method: "POST",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				project_id: project_id,
				description: description,
				start_value: start_value,
				end_value: end_value,
			}),
		},
	);
	return response.json();
}

export async function updateKeyResult(
	keyResult: KeyResult,
): Promise<KeyResult> {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/key_results/${keyResult.id}`,
		{
			method: "PATCH",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(keyResult),
		},
	);

	return await response.json();
}

export async function deleteKeyResult(key_result_id: string) {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/key_results/${key_result_id}`,
		{
			method: "DELETE",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
		},
	);

	return response.ok;
}

export async function getKeyResults() {
	const t = getCookie("token") ?? "";

	const response = await fetch(`${PUBLIC_API_URL}/key_results`, {
		method: "GET",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response.json();
}

export async function getKeyResultObjective(objective_id: string) {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/objectives/${objective_id}/key_results`,
		{
			method: "GET",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
		},
	);

	return response.json();
}

export async function createTaskKeyResult(
	key_result_id: string,
	description: string,
	task_state: TaskState,
) {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/key_results/${key_result_id}/tasks`,
		{
			method: "POST",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				description: description,
				task_state: task_state,
			}),
		},
	);
	console.log(response);

	return response;
}

export async function updateTask(task: Task): Promise<Task> {
	const t = getCookie("token") ?? "";
	const response = await fetch(`${PUBLIC_API_URL}/tasks/${task.id}`, {
		method: "PATCH",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(task),
	});

	return await response.json();
}

export async function getTasks() {
	const t = getCookie("token") ?? "";
	const response = await fetch(`${PUBLIC_API_URL}/tasks`, {
		method: "GET",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

	return response.json();
}

export async function deleteTask(task_id: string) {
	const t = getCookie("token") ?? "";
	const response = await fetch(`${PUBLIC_API_URL}/tasks/${task_id}`, {
		method: "DELETE",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

	return response.ok;
}

export async function getTasksKeyResult(key_result_id: string) {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/key_results/${key_result_id}/tasks`,
		{
			method: "GET",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
		},
	);

	return response.json();
}

export async function addUserProject(
	project_id: string,
	user_id: string,
	role: string,
) {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/projects/${project_id}/users/${user_id}?role?=${role}`,
		{
			method: "Post",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
		},
	);
	return response.json();
}

export async function getUsersProject(project_id: string) {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/projects/${project_id}/users`,
		{
			method: "GET",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
		},
	);

	return response.json();
}

export async function addObjectiveProject(
	project_id: string,
	objective_id: string,
) {
	const t = getCookie("token") ?? "";
	const response = await fetch(
		`${PUBLIC_API_URL}/projects/${project_id}/objectives/${objective_id}`,
		{
			method: "Post",
			headers: {
				Authorization: t,
				"Content-Type": "application/json",
			},
		},
	);
	return response.json();
}
