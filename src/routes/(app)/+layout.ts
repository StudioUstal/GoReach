import { waitForAuthUser } from '$lib/services/auth.service';
import { GetEntries, GetGoals, GetRanks, GetTodayEntry } from '$lib/services/firestore.service';
import type { User } from '$lib/types/user';
import { GetTodayKey } from '$lib/utils/keys';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load = async ({ depends }) => {
	depends('app:layout');
	const currentUser = await waitForAuthUser();

	if (!currentUser) {
		throw redirect(302, resolve('/login'));
	}

	const ranks = await GetRanks();
	const goals = await GetGoals(currentUser.uid);
	const entries = await GetEntries(currentUser.uid);
	const todayEntry = await GetTodayEntry(currentUser.uid, GetTodayKey());

	return {
		user: currentUser as User,
		ranks,
		goals,
		todayEntry,
		entries
	};
};
