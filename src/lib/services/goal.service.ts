import { auth, db } from '$lib/firebase';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import type { Goal } from '$lib/types/goal';

export const UpdateGoalSettings = async (
	goalId: Goal['id'],
	updates: Partial<Pick<Goal, 'max' | 'time'>>
) => {
	if (!auth || !db) throw new Error('Firebase not initialized');

	const user = auth.currentUser;

	if (!user) {
		throw new Error('User is not authenticated');
	}

	if (Object.keys(updates).length === 0) return;

	const goalsRef = collection(db, 'users', user.uid, 'goals');
	const goalSnapshot = await getDocs(query(goalsRef, where('id', '==', goalId)));

	await Promise.all(
		goalSnapshot.docs.map((goalDoc) =>
			updateDoc(goalDoc.ref, {
				...updates
			})
		)
	);
};