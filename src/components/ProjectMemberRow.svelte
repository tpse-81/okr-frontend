<script lang="ts">
import type { ProjectRole, User } from "$lib/types";

type Mode = "member" | "nonMember";

let props: {
	user: User;
	mode: Mode;
	currentRole: ProjectRole;

	pending?: boolean;
	canManageAnything?: boolean;
	manageTarget?: boolean;
	viewerIsAdmin?: boolean;

	roleLabel: (r: ProjectRole) => string;
	onChangeRole: (user: User, role: ProjectRole) => void;
	onToggleMembership: (user: User, checked: boolean) => void;
} = $props();

const pending = $derived(props.pending ?? false);
const canManageAnything = $derived(props.canManageAnything ?? false);
const manageTarget = $derived(props.manageTarget ?? false);
const viewerIsAdmin = $derived(props.viewerIsAdmin ?? false);

const canEdit = $derived(canManageAnything && manageTarget && !pending);

let currentRole = $state<ProjectRole>(props.currentRole);
$effect(() => {
	currentRole = props.currentRole;
});

let isChecked = $state(props.mode === "member");
$effect(() => {
	isChecked = props.mode === "member";
});

const roleSelectDisabled = $derived(
	pending || (!viewerIsAdmin && currentRole === "leader"),
);
</script>

<tr>
  <td>
    <div class="flex items-center gap-2">
      <div class="avatar placeholder">
        <div class="bg-neutral text-neutral-content rounded-full w-8 grid items-center">
          <span class="text-xs m-auto">{props.user.name?.[0]?.toUpperCase() ?? "?"}</span>
        </div>
      </div>
      <div class="min-w-0">
        <div class="font-medium truncate">{props.user.name}</div>
        {#if props.user.is_admin}
          <div class="badge badge-outline badge-sm">admin</div>
        {/if}
      </div>
    </div>
  </td>

  <td class="hidden md:table-cell">{props.user.email}</td>

  <td class="w-44">
    {#if props.user.is_admin}
      <span class="badge badge-outline badge-sm">admin</span>
    {:else if props.mode === "nonMember"}
      <span class="opacity-50 text-sm">member</span>
      {#if !manageTarget}
        <div class="text-xs opacity-60 mt-1">only admin can add this user</div>
      {/if}
    {:else}
      {#if !canManageAnything || !manageTarget}
        <span class="badge badge-outline badge-sm">{props.roleLabel(currentRole)}</span>
        {#if canManageAnything && !manageTarget}
          <div class="text-xs opacity-60 mt-1">only admin can edit</div>
        {/if}
      {:else}
        <select
          class="select select-bordered select-sm w-full"
          bind:value={currentRole}
          disabled={roleSelectDisabled}
          onchange={() => props.onChangeRole(props.user, currentRole)}
        >
          <option value="member">member</option>
          <option value="leader">teamlead</option>
        </select>

        {#if !viewerIsAdmin && currentRole === "leader"}
          <div class="text-xs opacity-60 mt-1">teamleads cannot be edited by teamleads</div>
        {/if}
      {/if}
    {/if}
  </td>


  <td class="w-24 text-right">
      <input
        type="checkbox"
        class="checkbox"
        bind:checked={isChecked}
        disabled={!canEdit}
        onchange={() => props.onToggleMembership(props.user, isChecked)}
      />
  </td>
</tr>
