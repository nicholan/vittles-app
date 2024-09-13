export function timeAgo(postDate: Date): string {
	const now = new Date();
	const secondsAgo = Math.floor((now.getTime() - postDate.getTime()) / 1000);
	const daysAgo = Math.floor(secondsAgo / (24 * 60 * 60));

	const formatDate = (date: Date) => {
		const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
		return new Intl.DateTimeFormat("en-US", options).format(date);
	};

	const formatFullDate = (date: Date) => {
		const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
		return new Intl.DateTimeFormat("en-US", options).format(date);
	};

	if (daysAgo < 1) {
		if (secondsAgo < 60) return `${Math.floor(secondsAgo)}s`;
		if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m`;
		return `${Math.floor(secondsAgo / 3600)}h`;
	}

	const postYear = postDate.getFullYear();
	const currentYear = now.getFullYear();
	return daysAgo < 365 && postYear === currentYear ? formatDate(postDate) : formatFullDate(postDate);
}

export function formatCount(count: number): string {
	if (count < 1000) {
		return count.toString();
	}
	if (count < 1000000) {
		return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
	}
	return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
}

export function shortenText(name: string, maxLength = 15): string {
	if (name.length <= maxLength) {
		return name;
	}

	return `${name.slice(0, maxLength)}...`;
}

export function formatDate(dateString: Date) {
	const date = new Date(dateString);

	const timeFormatter = new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});

	const dateFormatter = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	const formattedTime = timeFormatter.format(date);
	const formattedDate = dateFormatter.format(date);

	return `${formattedTime} · ${formattedDate}`;
}
