import { auth } from '$lib/stores/auth';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { get } from 'svelte/store';

export const ssr = false;

export const load = async () => {
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

	if (authState.user) {
		throw redirect(302, resolve('/'));
	}
};
