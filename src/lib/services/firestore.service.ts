import { db } from '$lib/firebase';
import type { Entry, EntryAction } from '$lib/types/entry';
import type { Goal } from '$lib/types/goal';
import type { Rank } from '$lib/types/rank';
import { collection, getDocs } from 'firebase/firestore';

const normalizeEntry = (dateKey: string, data: Record<string, unknown>): Entry => {
	const actions = (data.actions ?? data.goals ?? []) as EntryAction[];

	return {
		dateKey,
		actions
	};
};

export const GetGoals = async (userId: string) => {
	if (!db) throw new Error('Firebase not initialized');
	const goalsRef = collection(db, 'users', userId, 'goals');
	const goalsSnapshot = await getDocs(goalsRef);

	return goalsSnapshot.docs.map((doc) => doc.data()).toSorted((a, b) => a.id - b.id) as Goal[];
};

export const GetEntries = async (userId: string) => {
	if (!db) throw new Error('Firebase not initialized');
	const entriesRef = collection(db, 'users', userId, 'entries');
	const entriesSnapshot = await getDocs(entriesRef);

	return entriesSnapshot.docs.map((doc) => normalizeEntry(doc.id, doc.data()));
};

export const GetTodayEntry = async (userId: string, dateKey: string) => {
	if (!db) throw new Error('Firebase not initialized');
	const entriesRef = collection(db, 'users', userId, 'entries');
	const entriesSnapshot = await getDocs(entriesRef);
	const todayEntryDoc = entriesSnapshot.docs.find((doc) => doc.id === dateKey);

	return todayEntryDoc ? normalizeEntry(todayEntryDoc.id, todayEntryDoc.data()) : null;
};

export const GetWeeklyEntries = async (
	userId: string,
	weekStartKey: string,
	weekEndKey: string
) => {
	if (!db) throw new Error('Firebase not initialized');
	const entriesRef = collection(db, 'users', userId, 'entries');
	const entriesSnapshot = await getDocs(entriesRef);
	const weeklyEntries = entriesSnapshot.docs
		.filter((doc) => doc.id >= weekStartKey && doc.id <= weekEndKey)
		.map((doc) => normalizeEntry(doc.id, doc.data()));

	return weeklyEntries;
};

export const GetRanks = async () => {
	if (!db) throw new Error('Firebase not initialized');
	const ranksRef = collection(db, 'ranks');
	const ranksSnapshot = await getDocs(ranksRef);

	return ranksSnapshot.docs.map((doc) => doc.data()) as Rank[];
};
