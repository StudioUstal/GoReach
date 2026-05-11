import type { EntryAction } from '$lib/types/entry';
import { auth, db } from '$lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';

export const UpsertEntry = async (dateKey: string, entry_actions: EntryAction[]) => {
	if (!auth || !db) throw new Error('Firebase not initialized');
	const user = auth.currentUser;

	if (!user) {
		throw new Error('User is not authenticated');
	}

	const entryRef = doc(db, 'users', user.uid, 'entries', dateKey);

	await runTransaction(db, async (transaction) => {
		const entrySnapshot = await transaction.get(entryRef);
		const existingActions = entrySnapshot.exists()
			? ((entrySnapshot.data().actions as EntryAction[]) ?? [])
			: [];
		const actionsByGoalId = new Map<number, EntryAction>();

		for (const action of existingActions) {
			actionsByGoalId.set(action.goalId, action);
		}

		for (const action of entry_actions) {
			actionsByGoalId.set(action.goalId, action);
		}

		transaction.set(entryRef, {
			dateKey,
			actions: Array.from(actionsByGoalId.values())
		});
	});
};

export const DeleteEntry = async (dateKey: string) => {
	if (!auth || !db) throw new Error('Firebase not initialized');

	const user = auth.currentUser;

	if (!user) {
		throw new Error('User is not authenticated');
	}

	const entryRef = doc(db, 'users', user.uid, 'entries', dateKey);

	await runTransaction(db, async (transaction) => {
		transaction.delete(entryRef);
	});
};
