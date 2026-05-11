export const buildDateRange = (startKey: string, endKey: string) => {
	const start = new Date(startKey);
	const end = new Date(endKey);
	const keys: string[] = [];
	for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		keys.push(`${year}-${month}-${day}`);
	}
	return keys;
};
