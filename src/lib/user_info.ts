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

	  const raw = JSON.parse(userInfoString) as Partial<User>;
	  // backward-compatible default for older localStorage entries
	  return {
	    ...raw,
	    must_change_password: raw.must_change_password ?? false,
	  } as User;
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
