import { type Writable, writable } from "svelte/store";
import type { User } from "./types";

const USER_INFO_STORAGE_KEY = "user_info";

/** A store containing information about the user.

Don't write to this directly, use the exported methods instead!
**/
export const userInfoStore: Writable<User | null> = writable(null);

// may only run on client side (e.g. onMount)!
function getUserInfo(): User | null {
	const userInfoString = window.localStorage.getItem(USER_INFO_STORAGE_KEY);
	if (!userInfoString) return null;

	const userInfo: User = JSON.parse(userInfoString);
	return userInfo;
}

export function setUserInfo(userInfo: User | null) {
	if (userInfo) {
		window.localStorage.setItem(
			USER_INFO_STORAGE_KEY,
			JSON.stringify(userInfo),
		);
	} else {
		window.localStorage.removeItem(USER_INFO_STORAGE_KEY);
	}

	userInfoStore.set(userInfo);
}

export function restoreUserInfoFromStorage() {
	userInfoStore.set(getUserInfo());
}
