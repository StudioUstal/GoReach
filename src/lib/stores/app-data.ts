import { browser } from '$app/environment';
import { GetTodayKey } from '$lib/utils/keys';
import type { Entry } from '$lib/types/entry';
import type { Goal } from '$lib/types/goal';
import type { Rank } from '$lib/types/rank';
import { writable } from 'svelte/store';
import {
	SubscribeToEntries,
	SubscribeToGoals,
	SubscribeToRanks
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
export const realtimeReady = writable<boolean>(false);

export const seedAppData = (snapshot: AppDataSnapshot) => {
	ranks.set(snapshot.ranks);
	goals.set(snapshot.goals);
	entries.set(snapshot.entries);
	todayEntry.set(snapshot.todayEntry);
};

export const startRealtimeSync = (userId: string) => {
	if (!browser) return () => {};

	let pending = 0;
	const unsubscribes: Array<() => void> = [];

	const once = (fn: (v: any) => void) => {
		let called = false;
		return (v: any) => {
			if (!called) {
				called = true;
				pending -= 1;
				if (pending <= 0) realtimeReady.set(true);
			}
			fn(v);
		};
	};

	// wrap each realtime listener so we can detect first update
	pending += 1;
	unsubscribes.push(SubscribeToRanks(once((nextRanks) => ranks.set(nextRanks))));

	pending += 1;
	unsubscribes.push(
		SubscribeToGoals(
			userId,
			once((nextGoals) => goals.set(nextGoals))
		)
	);

	pending += 1;
	unsubscribes.push(
		SubscribeToEntries(
			userId,
			once((nextEntries) => entries.set(nextEntries))
		)
	);

	// derive `todayEntry` from the `entries` store to avoid an extra onSnapshot listener
	const entriesDerivedUnsub = entries.subscribe((nextEntries) => {
		const todayKey = GetTodayKey();
		const today = nextEntries.find((e) => e.dateKey === todayKey) ?? null;
		todayEntry.set(today);
	});

	unsubscribes.push(entriesDerivedUnsub);

	// If there were no realtime listeners (edge-case), mark ready
	if (pending === 0) realtimeReady.set(true);

	return () => {
		for (const unsubscribe of unsubscribes) {
			try {
				unsubscribe();
			} catch {}
		}
	};
};
