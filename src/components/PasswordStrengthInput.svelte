<script lang="ts">
import zxcvbn, { type ZXCVBNResult } from "zxcvbn";
import type { User } from "$lib/types";

let {
	password = $bindable(),
	userInfo,
	placeholder,
	class: extraClasses = "",
}: {
	password: string;
	userInfo: User;
	placeholder: string;
	class: string;
} = $props();
let passwordStrength: ZXCVBNResult = $derived(
	zxcvbn(password, [userInfo.name, userInfo.email]),
);
</script>

<input type="password" class="input input-bordered {extraClasses}" placeholder={placeholder} bind:value={password} />
{#if password}
<progress class={"progress w-full " + (passwordStrength.score >= 3 ? "progress-success" : "progress-error")} value={passwordStrength.score} max="4"></progress>
<div>{passwordStrength.feedback.warning}</div>
{/if}
