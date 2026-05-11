import { auth, db } from '$lib/firebase';
import {
	collection,
	doc,
	getDocs,
	limit,
	orderBy,
	query,
	runTransaction
} from 'firebase/firestore';

export const CreateTask = async (
	title: string,
	emoji: string,
	target: number,
	time: string,
	progressColor: string
) => {
	if (!title || !emoji || !target) return;

	if (!auth || !db) throw new Error('Firebase not initialized');

	const user = auth.currentUser;

	if (!user) {
		throw new Error('User is not authenticated');
	}

	const goalsRef = collection(db, 'users', user.uid, 'goals');
	const highestGoalQuery = query(goalsRef, orderBy('id', 'desc'), limit(1));
	const snapshot = await getDocs(highestGoalQuery);
	const nextId = snapshot.empty ? 1 : ((snapshot.docs[0].data().id as number) ?? 0) + 1;

	await runTransaction(db, async (transaction) => {
		const goalRef = doc(goalsRef);

		transaction.set(goalRef, {
			id: nextId,
			name: title,
			icon: emoji,
			max: target,
			time,
			progressColor
		});
	});
};
