import { get } from "svelte/store";
// load api url from .env file
import { PUBLIC_API_URL } from "$env/static/public";
import { token } from "$lib/stores";
import type { Project, TaskState } from "$lib/types";

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
	const t = get(token);
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
	});

	const response_body = await response.json();
	return response_body.jwt_token;
}

async function getFileBytes(file: File) {
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
	imageInput: File | null,
) {
	const t = get(token);
	const imageAsBase64 = imageInput ? await getFileBytes(imageInput) : null;
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
			icon: imageAsBase64,
		}),
	});
	console.log(response);

	return response;
}

export async function getProjects() {
	const t = get(token);
	if (!t) throw new Error("Token ist leer");

	const response = await fetch(`${PUBLIC_API_URL}/projects`, {
		method: "GET",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
	});

	console.log("Aktueller Token:", get(token));

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response.json();
}

export async function getProjectById(projectId: string): Promise<Project> {
	const t = get(token);
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
	const t = get(token);
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

export async function getObjectives() {
	const t = get(token);

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
	const t = get(token);
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
	const t = get(token);
	const response = await fetch(`${PUBLIC_API_URL}/objectives/${objective_id}/key_results`, {
		method: "POST",
		headers: {
			Authorization: t,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			objective_id: objective_id,
			project_id: project_id,
			description: description,
			start_value: start_value,
			end_value: end_value,
		}),
	});
	return response.json();
}

export async function getKeyResults() {
	const t = get(token);

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
	const t = get(token);
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
	const t = get(token);
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

export async function getTasksKeyResult(key_result_id: string) {
	const t = get(token);
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
	const t = get(token);
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
	const t = get(token);
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
	const t = get(token);
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
