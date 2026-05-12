type NavLink = {
	name: string;
	href: '/' | '/week' | '/rewards' | '/settings';
	icon: string;
};

export const NAV_LINKS: NavLink[] = [
	{
		name: 'Dnes',
		href: '/',
		icon: '📋'
	},
	{
		name: 'Týden',
		href: '/week',
		icon: '📊'
	},
	{
		name: 'Odměny',
		href: '/rewards',
		icon: '⚡'
	},
	{
		name: 'Nastavení',
		href: '/settings',
		icon: '⚙️'
	}
];
