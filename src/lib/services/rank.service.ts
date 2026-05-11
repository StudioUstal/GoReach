import type { Rank } from '$lib/types/rank';
import type { Entry } from '$lib/types/entry';
import type { Goal } from '$lib/types/goal';

export const GetCurrentRank = (
	xpOrWeekly: number | { weeklyEntries: Entry[]; goals: Goal[]; totalDays?: number },
	ranks: Rank[]
) => {
	let xp = 0;

	if (typeof xpOrWeekly === 'number') {
		xp = xpOrWeekly;
	} else {
		const { weeklyEntries, goals, totalDays } = xpOrWeekly;

		const dailyXps = weeklyEntries.map((entry) => {
			let dayXp = 0;
			for (const action of entry.actions) {
				const goal = goals.find((g) => g.id === action.goalId);
				if (goal && action.progress >= goal.max) {
					dayXp += 100;
				}
			}
			return dayXp;
		});

		const sum = dailyXps.reduce((a, b) => a + b, 0);
		const divisor = totalDays || weeklyEntries.length;
		xp = divisor ? sum / divisor : 0;
	}

	// Sort ranks by requiredXp in descending order
	const sortedRanks = [...ranks].sort((a, b) => b.requiredXp - a.requiredXp);

	for (const rank of sortedRanks) {
		if (xp >= rank.requiredXp) return rank;
	}
};
