<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import {
	addUserProject,
	getUserRoleProject,
	getUsers,
	getUsersProject,
	removeUserProject,
	updateUserRoleProject,
} from "$lib/api";
import type { ProjectRole, User } from "$lib/types";
import { userInfoStore } from "$lib/user_info";
import ProjectMemberRow from "./ProjectMemberRow.svelte";

let { projectId }: { projectId: string } = $props();
// ----------------------------
// State
// ----------------------------
let allUsers = $state<User[]>([]);
let memberRoles = $state<Record<string, ProjectRole>>({});
let pending = $state<Record<string, boolean>>({});
let filter = $state<string>("");
let loading = $state<boolean>(false);

let me = $state<User | null>(null);
let myProjectRole = $state<ProjectRole | null>(null);

let message = $state<{
	type: "success" | "error" | "info";
	text: string;
} | null>(null);

function showMessage(type: "success" | "error" | "info", text: string) {
	message = { type, text };
	setTimeout(() => {
		message = null;
	}, 2500);
}

function setPending(userId: string, value: boolean) {
	pending = { ...pending, [userId]: value };
}

const isMember = (userId: string) => userId in memberRoles;

// ----------------------------
// Permissions logic (UI-side)
// ----------------------------
let canManageAnything = $derived(
	(me?.is_admin ?? false) || myProjectRole === "leader",
);

function canManageTarget(target: User): boolean {
	if (!me) return false; // fallback: if we can't detect "me", don't hide controls completely
	if (me.is_admin) return true;

	// must be leader in project
	if (myProjectRole !== "leader") return false;

	// teamlead can do members (not admins, not other leaders)
	if (target.is_admin) return false;

	const targetRole = memberRoles[target.id]; // only set if member
	if (targetRole === "leader") return false;

	// prevent editing yourself as teamlead
	if (target.id === me.id) return false;

	return true;
}

function roleLabel(role: ProjectRole): string {
	return role === "leader" ? "teamlead" : "member";
}

async function refreshMyRole() {
	if (!me) {
		myProjectRole = null;
		return;
	}

	if (me.is_admin) {
		myProjectRole = null;
		return;
	}

	try {
		const r = await getUserRoleProject(projectId, me.id);
		const myRole: ProjectRole = r?.role ?? "member";
		myProjectRole = myRole;
		memberRoles = { ...memberRoles, [me.id]: myRole };
	} catch {
		myProjectRole = null;
	}
}

// ----------------------------
// Load data
// ----------------------------
async function load() {
	loading = true;
	try {
		message = null;

		const [users, projectUsers] = await Promise.all([
			getUsers(),
			getUsersProject(projectId),
		]);

		allUsers = users;

		// Build member id list from project users
		const projList: User[] = projectUsers;

		// Fetch roles for project users
		const roleEntries = await Promise.all(
			projList.map(async (u) => {
				// admins: role in project is irrelevant, but still "member" marker
				if (u.is_admin) return [u.id, "member" as ProjectRole] as const;

				try {
					const r = await getUserRoleProject(projectId, u.id);
					return [u.id, (r?.role ?? "member") as ProjectRole] as const;
				} catch {
					return [u.id, "member" as ProjectRole] as const;
				}
			}),
		);

		memberRoles = Object.fromEntries(roleEntries);
	} catch (e) {
		console.error(e);
		showMessage("error", "Could not load members.");
	} finally {
		loading = false;
	}
}

onMount(() => {
	me = $userInfoStore;
	if (me) void refreshMyRole();
	load();
});

// ----------------------------
// Actions
// ----------------------------
async function addToProject(user: User) {
	setPending(user.id, true);
	try {
		// default role when adding
		await addUserProject(projectId, user.id, "member");

		memberRoles = { ...memberRoles, [user.id]: "member" };
		showMessage(
			"success",
			$_("users.addedToProject", { values: { name: user.name } }),
		);
	} catch (e) {
		console.error(e);
		showMessage("error", "Request failed.");
		await load();
	} finally {
		setPending(user.id, false);
	}
}

async function removeFromProject(user: User) {
	setPending(user.id, true);
	try {
		await removeUserProject(projectId, user.id);

		const next = { ...memberRoles };
		delete next[user.id];
		memberRoles = next;

		showMessage("success", `${user.name} removed from project.`);
	} catch (e) {
		console.error(e);
		showMessage("error", "Request failed.");
		await load();
	} finally {
		setPending(user.id, false);
	}
}

async function changeRole(user: User, newRole: ProjectRole) {
	memberRoles = { ...memberRoles, [user.id]: newRole };

	setPending(user.id, true);
	try {
		await updateUserRoleProject(projectId, user.id, newRole);

		showMessage("success", `${user.name} is now ${roleLabel(newRole)}.`);
	} catch (e) {
		console.error(e);
		showMessage("error", "Request failed.");
		await load();
	} finally {
		setPending(user.id, false);
	}
}

// ----------------------------
// Derived lists
// ----------------------------
let filteredUsers = $derived(
	allUsers
		.filter((u) => {
			const q = filter.trim().toLowerCase();
			if (!q) return true;
			return (
				(u.name ?? "").toLowerCase().includes(q) ||
				(u.email ?? "").toLowerCase().includes(q)
			);
		})
		.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
);

let members = $derived(filteredUsers.filter((u) => isMember(u.id)));

let nonMembers = $derived(filteredUsers.filter((u) => !isMember(u.id)));
</script>
<div class="card bg-base-100 border border-base-300">
	<div class="card-body gap-4">
		<div class="flex items-center justify-between gap-3">
			<h2 class="card-title">{$_("users.members")}</h2>
			<div class="flex items-center gap-3">
				{#if loading}
					<span class="loading loading-spinner loading-sm"></span>
				{/if}
				<span class="text-sm opacity-70">
					{members.length} {$_("users.member")}{members.length === 1 ? "" : "s"}
				</span>
			</div>
		</div>

		{#if message}
			<div
				class={`alert ${
					message.type === "success"
						? "alert-success"
						: message.type === "info"
							? "alert-info"
							: "alert-error"
				}`}
			>
				<span>{message.text}</span>
			</div>
		{/if}

		<div class="flex flex-col md:flex-row gap-3 md:items-center">
			<input
				type="text"
				placeholder={$_("users.search")}
				bind:value={filter}
				class="input input-bordered w-full md:max-w-sm"
			/>
			{#if me && !canManageAnything}
				<div class="text-sm opacity-70">
					{$_("users.readOnlyWarning")}
				</div>
			{/if}
		</div>

		<!-- Members table -->
		<div class="overflow-x-auto">
			<table class="table table-zebra">
				<thead>
					<tr>
						<th>{$_("users.title")}</th>
						<th class="hidden md:table-cell">{$_("users.email")}</th>
						<th class="w-44">{$_("users.role")}</th>
						<th class="w-24 text-right">{$_("users.inProject")}</th>
					</tr>
				</thead>

				<tbody>
					{#if members.length === 0}
						<tr>
							<td colspan="4" class="opacity-70">{$_("users.noMembersYet")}</td>
						</tr>
					{:else}
						{#each members as user (user.id)}
							{@const manageTarget = canManageAnything && canManageTarget(user)}
							{@const currentRole = memberRoles[user.id] ?? "member"}

							<ProjectMemberRow
								user={user}
								mode="member"
								currentRole={currentRole}
								pending={pending[user.id] ?? false}
								canManageAnything={canManageAnything}
								manageTarget={manageTarget}
								viewerIsAdmin={me?.is_admin ?? false}
								roleLabel={roleLabel}
								onChangeRole={changeRole}
								onToggleMembership={(u, checked) => {
									if (!checked) removeFromProject(u);
								}}
							/>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Non-members collapsible (only for managers) -->
		{#if canManageAnything}
			<details class="collapse collapse-arrow border border-base-300 bg-base-100">
				<summary class="collapse-title font-medium">
					{$_("users.addUsers")} ({nonMembers.length})
				</summary>

				<div class="collapse-content">
					<div class="overflow-x-auto">
						<table class="table table-zebra">
							<thead>
								<tr>
									<th>{$_("users.title")}</th>
									<th class="hidden md:table-cell">{$_("users.email")}</th>
									<th class="w-44">{$_("users.role")}</th>
									<th class="w-24 text-right">{$_("users.add")}</th>
								</tr>
							</thead>

							<tbody>
								{#if nonMembers.length === 0}
									<tr>
										<td colspan="4" class="opacity-70">{$_("users.noUsersToAdd")}</td>
									</tr>
								{:else}
									{#each nonMembers as user (user.id)}
										{@const manageTarget = canManageTarget(user)}

										<ProjectMemberRow
											user={user}
											mode="nonMember"
											currentRole={"member"}
											pending={pending[user.id] ?? false}
											canManageAnything={canManageAnything}
											manageTarget={manageTarget}
											viewerIsAdmin={me?.is_admin ?? false}
											roleLabel={roleLabel}
											onChangeRole={changeRole}
											onToggleMembership={(u, checked) => {
												if (checked) addToProject(u);
											}}
										/>
									{/each}
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			</details>
		{/if}
	</div>
</div>
