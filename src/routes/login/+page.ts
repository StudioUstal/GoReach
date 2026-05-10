import { waitForAuthUser } from '$lib/services/auth.service';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load = async () => {
	const currentUser = await waitForAuthUser();

	if (currentUser) {
		throw redirect(302, '/');
	}
};
