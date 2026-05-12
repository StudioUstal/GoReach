import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import { auth as firebaseAuth } from '$lib/firebase/index';
import { onAuthStateChanged } from 'firebase/auth';

export type AuthState = {
	user: User | null;
	loading: boolean;
	initialized: boolean;
};

const initialState: AuthState = {
	user: null,
	loading: true,
	initialized: false
};

function createAuthStore() {
	const { subscribe, set } = writable<AuthState>(initialState);
	let initialized = false;
	let unsubscribe: (() => void) | null = null;

	return {
		subscribe,
		initialize: () => {
			if (initialized) return;
			initialized = true;

			if (!firebaseAuth) {
				set({
					user: null,
					loading: false,
					initialized: true
				});
				return;
			}

			// Set up persistent listener - this survives hard reloads
			unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
				set({
					user,
					loading: false,
					initialized: true
				});
			});
		},
		destroy: () => {
			if (unsubscribe) {
				unsubscribe();
			}
		}
	};
}

export const auth = createAuthStore();
