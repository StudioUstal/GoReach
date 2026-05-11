import { browser } from '$app/environment';
import { GetTodayKey } from '$lib/utils/keys';
import type { Entry } from '$lib/types/entry';
import type { Goal } from '$lib/types/goal';
import type { Rank } from '$lib/types/rank';
import { writable } from 'svelte/store';
import {
	SubscribeToEntries,
	SubscribeToGoals,
	SubscribeToRanks,
	SubscribeToTodayEntry
} from '$lib/services/firestore.service';

export type AppDataSnapshot = {
	ranks: Rank[];
	goals: Goal[];
	entries: Entry[];
	todayEntry: Entry | null;
};

export const ranks = writable<Rank[]>([]);
export const goals = writable<Goal[]>([]);
export const entries = writable<Entry[]>([]);
export const todayEntry = writable<Entry | null>(null);

export const seedAppData = (snapshot: AppDataSnapshot) => {
	ranks.set(snapshot.ranks);
	goals.set(snapshot.goals);
	entries.set(snapshot.entries);
	todayEntry.set(snapshot.todayEntry);
};

export const startRealtimeSync = (userId: string) => {
	if (!browser) return () => {};

	const todayKey = GetTodayKey();
	const unsubscribes = [
		SubscribeToRanks((nextRanks) => ranks.set(nextRanks)),
		SubscribeToGoals(userId, (nextGoals) => goals.set(nextGoals)),
		SubscribeToEntries(userId, (nextEntries) => entries.set(nextEntries)),
		SubscribeToTodayEntry(userId, todayKey, (nextTodayEntry) => todayEntry.set(nextTodayEntry))
	];

	return () => {
		for (const unsubscribe of unsubscribes) {
			unsubscribe();
		}
	};
};
