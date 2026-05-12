import { auth } from '$lib/stores/auth';

export const prerender = false;
export const ssr = true;

export const load = () => {
	// Initialize auth listener once for entire app
	auth.initialize();
};
