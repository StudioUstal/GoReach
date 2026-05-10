import { waitForAuthUser } from '$lib/services/auth.service';
import { GetGoals, GetRanks, GetTodayEntry } from '$lib/services/firestore.service';
import type { User } from '$lib/types/user';
import { GetTodayKey } from '$lib/utils/keys';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export const ssr = false;

export const load = async ({ depends }) => {
	depends('app:layout');
	const currentUser = await waitForAuthUser();

	if (!currentUser) {
		throw redirect(302, `${base}/login`);
	}

	const ranks = await GetRanks();
	const goals = await GetGoals(currentUser.uid);
	const todayEntry = await GetTodayEntry(currentUser.uid, GetTodayKey());

	return {
		user: currentUser as User,
		ranks,
		goals,
		todayEntry
	};
};
