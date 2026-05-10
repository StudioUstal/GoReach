import { auth } from '$lib/firebase/index';
import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider
} from 'firebase/auth';
import type { User } from 'firebase/auth';

export const Register = async (email: string, password: string) => {
	if (!auth) throw new Error('Firebase auth not initialized');
	return await createUserWithEmailAndPassword(auth, email, password);
};

export const Login = async (email: string, password: string) => {
	if (!auth) throw new Error('Firebase auth not initialized');
	return await signInWithEmailAndPassword(auth, email, password);
};

export const LoginWithGoogle = async () => {
	if (!auth) throw new Error('Firebase auth not initialized');
	const provider = new GoogleAuthProvider();
	return await signInWithPopup(auth, provider);
};

export const waitForAuthUser = async () => {
	if (!auth) return null;
	return await new Promise<User | null>((resolve) => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			unsubscribe();
			resolve(user);
		});
	});
};

export const Logout = async () => {
	if (!auth) throw new Error('Firebase auth not initialized');
	await auth.signOut();
};
