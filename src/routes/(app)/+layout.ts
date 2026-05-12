import { auth } from '$lib/stores/auth';
import { GetEntries, GetGoals, GetRanks, GetTodayEntry } from '$lib/services/firestore.service';
import type { User } from '$lib/types/user';
import { GetTodayKey } from '$lib/utils/keys';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { get } from 'svelte/store';

export const load = async ({ depends }) => {
	depends('app:layout');

	// Wait for auth to be initialized
	let authState = get(auth);
	if (!authState.initialized) {
		// Wait for initialization to complete
		await new Promise<void>((resolve) => {
			const unsubscribe = auth.subscribe((state) => {
				if (state.initialized) {
					unsubscribe();
					resolve();
				}
			});
		});
		authState = get(auth);
	}

	const currentUser = authState.user;
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
