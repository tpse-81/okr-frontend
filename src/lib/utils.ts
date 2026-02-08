const YEAR_IN_MILLIS = 365 * 24 * 60 * 60 * 1000;
const DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

export interface DateDiff {
	years: number;
	days: number;
}

export function calculateDateDifference(start: Date, end: Date): DateDiff {
	const diff = end.getTime() - start.getTime();

	const years = Math.floor(diff / YEAR_IN_MILLIS);
	const days = Math.floor((diff % YEAR_IN_MILLIS) / DAY_IN_MILLIS);

	return { years, days };
}

export function formatDeadline(deadline: Date): string {
	const now = new Date();
	const { years, days } = calculateDateDifference(now, deadline);

	if (years <= 0 && days <= 0) {
		return "overdue";
	}

	let args = [];
	if (years > 0) {
		args.push(`${years} years`);
	}
	if (days > 0) {
		args.push(`${days} days`);
	}

	return `due in  + ${args.join(" ")}`;
}

export function formatDate(date: Date): string {
	return date.toLocaleDateString(undefined, {
		weekday: "short",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function isBetween(value: number, a: number, b: number) {
	return value >= Math.min(a, b) && value <= Math.max(a, b);
}

export function generatePassword(length = 8): string {
	const charset =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

	if (typeof crypto === "undefined" || !crypto.getRandomValues) {
		throw new Error("crypto.getRandomValues is not available");
	}

	const buf = new Uint32Array(length);
	crypto.getRandomValues(buf);
	return Array.from(buf, (x) => charset[x % charset.length]).join("");
}

export async function copyToClipboard(text: string): Promise<void> {
	if (
		typeof navigator !== "undefined" &&
		navigator.clipboard &&
		navigator.clipboard.writeText
	) {
		await navigator.clipboard.writeText(text);
		return;
	}

	if (typeof document === "undefined") {
		throw new Error("Clipboard is not available");
	}

	const el = document.createElement("textarea");
	el.value = text;
	document.body.appendChild(el);
	el.select();
	document.execCommand("copy");
	document.body.removeChild(el);
}
