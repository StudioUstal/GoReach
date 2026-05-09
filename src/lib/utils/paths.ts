import { base } from '$app/paths';
import { page } from '$app/state';

const normalizePath = (path: string) => {
	return path.replace(base, '') || '/';
};

export const isActive = (href: string) => {
	return normalizePath(page.url.pathname) === href;
};
