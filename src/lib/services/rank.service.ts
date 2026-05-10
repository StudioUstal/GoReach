import type { Rank } from '$lib/types/rank';

export const GetCurrentRank = (xp: number, ranks: Rank[]) => {
	// Sort ranks by requiredXP in descending order
	const sortedRanks = ranks.sort((a, b) => b.requiredXp - a.requiredXp);

	// Find the highest rank that the user qualifies for
	for (const rank of sortedRanks) {
		if (xp >= rank.requiredXp) {
			return rank;
		}
	}
};
