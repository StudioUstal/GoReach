type Goal = {
	id: number;
	name: string;
	icon?: string;
	description: string;
	progressColor?: string;
	progress?: number;
	max: number;
};

export const GOALS: Goal[] = [
	{
		id: 0,
		name: 'Cold Calling',
		icon: '📞',
		description: 'Cíl: 20 za den',
		progressColor: 'text-orange-500',
		progress: 10,
		max: 20
	},
	{
		id: 1,
		name: 'LinkedIn Outbound',
		icon: '💼',
		description: 'Cíl: 15 za den',
		progressColor: 'text-blue-500',
		progress: 5,
		max: 15
	},
	{
		id: 2,
		name: 'Instagram Outbound',
		icon: '📷',
		description: 'Cíl: 10 za den',
		progressColor: 'text-purple-500',
		progress: 4,
		max: 10
	},
	{
		id: 3,
		name: 'Email Outreach',
		icon: '✉️',
		description: 'Cíl: 25 za den',
		progressColor: 'text-yellow-600',
		progress: 6,
		max: 25
	}
];
