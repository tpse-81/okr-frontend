<script lang="ts">
import { Archive, Check, Info } from "@lucide/svelte";
import { _, locale } from "svelte-i18n";
import type { ArchiveReason, Project } from "$lib/types";
import { formatDeadline } from "$lib/utils";

let { project }: { project: Project } = $props();

type ArchiveMeta = { reason: ArchiveReason; format: string; badge: string };

const archiveReasons: ArchiveMeta[] = [
	{
		reason: "finalized",
		format: "projects.archiveReason.finalized",
		badge: "badge-success",
	},
	{
		reason: "on_break",
		format: "projects.archiveReason.on_break",
		badge: "badge-warning",
	},
	{
		reason: "give_up",
		format: "projects.archiveReason.give_up",
		badge: "badge-error",
	},
];

const archiveReasonMap = archiveReasons.reduce(
	(acc, r) => {
		acc[r.reason] = r;
		return acc;
	},
	{} as Record<ArchiveReason, ArchiveMeta>,
);

function getArchiveMeta(reason: ArchiveReason | null | undefined) {
	if (!reason) return { format: "common.archived", badge: "badge-warning" };
	return (
		archiveReasonMap[reason] ?? {
			format: "common.archived",
			badge: "badge-warning",
		}
	);
}

let archiveMeta = $derived(getArchiveMeta(project.archive_reason));
</script>

{#if project.is_archived}
	<div class={`badge ${archiveMeta.badge}`}>
		<Archive size="16" />
		{$_("projects.archivedWithReason", {values: { reason: $_(archiveMeta.format) },})}
	</div>
{:else if project.done}
	<div class="badge badge-success"><Check size="16" /> {$_("common.done")}</div>
{:else}
	<div class="badge badge-info">
		<Info size="16" /> {formatDeadline(new Date(project.deadline), $locale)}
	</div>
{/if}
