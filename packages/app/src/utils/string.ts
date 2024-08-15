export function timeAgo(postDate: Date): string {
	const now = new Date();
	const secondsAgo = Math.floor((now.getTime() - postDate.getTime()) / 1000);

	const intervals: Record<string, number> = {
		year: 365 * 24 * 60 * 60,
		month: 30 * 24 * 60 * 60,
		week: 7 * 24 * 60 * 60,
		day: 24 * 60 * 60,
		hour: 60 * 60,
		minute: 60,
		second: 1,
	};

	for (const interval in intervals) {
		const value = Math.floor(secondsAgo / intervals[interval]);
		if (value > 1) {
			return `${value} ${interval}s ago`;
		}
		if (value === 1) {
			return `${value} ${interval} ago`;
		}
	}

	// Fallback for cases where no interval matches
	return "just now";
}
