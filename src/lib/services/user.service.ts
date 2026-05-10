import { auth, db } from '$lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ensureUserDocument = async () => {
	const user = auth.currentUser;

	if (!user) return;

	const userRef = doc(db, 'users', user.uid);
	const snapshot = await getDoc(userRef);

	if (!snapshot.exists()) {
		await setDoc(userRef, {
			entries: []
		});
	}
};
