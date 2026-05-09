type NavLink = {
	name: string;
	href: string;
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
