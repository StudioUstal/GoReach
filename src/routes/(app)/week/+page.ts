import { GetWeeklyEntries } from '$lib/services/firestore.service';
import { GetTodayKey, GetWeekKey } from '$lib/utils/keys';

export const load = async ({ parent }) => {
	const data = await parent();
	const user = data.user;

	if (!user) {
		return {
			weeklyEntries: []
		};
	}

	const weeklyEntries = await GetWeeklyEntries(user.uid, GetWeekKey(), GetTodayKey());
	console.log('Weekly Entries:', weeklyEntries);

	return {
		weeklyEntries
	};
};
