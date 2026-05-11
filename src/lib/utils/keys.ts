export const GetTodayKey = (): string => {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const GetWeekKey = (): string => {
	const today = new Date();
	const lastWeek = new Date(today);
	lastWeek.setDate(today.getDate() - 7);

	const year = lastWeek.getFullYear();
	const month = String(lastWeek.getMonth() + 1).padStart(2, '0');
	const day = String(lastWeek.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};
