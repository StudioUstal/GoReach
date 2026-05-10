export type Entry = {
	dateKey: string; // date key in format YYYY-MM-DD unique for each day
	actions: EntryAction[]; // one current record per goal for the day
};

export type EntryAction = {
	goalId: number;
	progress: number;
	createdAt: number;
};
