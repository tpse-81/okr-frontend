<script lang="ts">
import { getFileBytes } from "$lib/api";

let iconInput: HTMLInputElement;
// svelte-ignore non_reactive_update
let iconFiles: FileList | null;

let {
	initialIcon,
	onStateChanged,
}: {
	initialIcon: string | null;
	onStateChanged: (icon: string | null, needsConfirm: boolean) => void;
} = $props();

let pendingIcon: string | null = $state(null);
// svelte-ignore state_referenced_locally
let confirmedIcon: string | null = $state(initialIcon);
let previewUrl: string | null = $state(null);
let needsConfirm = $state(false);

async function onIconChange() {
	const f = iconFiles?.item(0) ?? null;

	// reset
	pendingIcon = f ? String(await getFileBytes(f)) : null;
	confirmedIcon = null;
	needsConfirm = f != null;

	if (previewUrl) URL.revokeObjectURL(previewUrl);
	previewUrl = f ? URL.createObjectURL(f) : null;

	onStateChanged(pendingIcon, true);
}

function confirmIcon() {
	confirmedIcon = pendingIcon;
	needsConfirm = false;

	onStateChanged(confirmedIcon, false);
}

export function discardIcon() {
	pendingIcon = null;
	confirmedIcon = null;
	needsConfirm = false;

	if (previewUrl) URL.revokeObjectURL(previewUrl);
	previewUrl = null;

	iconInput.value = "";
	onStateChanged(null, false);
}
</script>

<div class="flex flex-col gap-3">
  <div class="form-control">
    <label for="project-logo" class="label">
        <span class="label-text">Projekt-Logo</span>
    </label>
    <input
        id="project-logo"
        type="file"
        accept="image/*"
        bind:this={iconInput}
        bind:files={iconFiles}
        onchange={onIconChange}
        class="file-input file-input-bordered w-full"
    />
  </div>

  <!-- Preview + Confirm -->
  {#if previewUrl}
    <div class="alert flex flex-col gap-3">
      <div class="w-full">
        <div class="text-sm font-semibold mb-2">Preview</div>
        <div class="h-32 w-full rounded bg-base-200 flex items-center justify-center overflow-hidden">
          <img src={previewUrl} alt="Logo preview" class="h-full w-full object-contain" />
        </div>
      </div>

      {#if needsConfirm}
        <div class="w-full flex flex-col gap-2">
          <div class="text-sm whitespace-normal">
            Do you really want to use this logo?
          </div>
          <div class="flex gap-2 flex-wrap">
            <button type="button" class="btn btn-primary" onclick={confirmIcon}>Accept</button>
            <button type="button" class="btn btn-ghost" onclick={discardIcon}>Discard</button>
          </div>
        </div>
      {:else if confirmedIcon}
        <div class="w-full text-sm opacity-80">
          Logo accepted
        </div>
      {/if}
    </div>
  {/if}
</div>
