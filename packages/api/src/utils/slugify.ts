export function slugify(text: string) {
	const slug = text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w-]+/g, "") // Remove all non-word chars
		.replace(/--+/g, "-") // Replace multiple - with single -
		.replace(/^-+/, "") // Trim - from start of text
		.replace(/-+$/, "");
	const randomString = generateRandomString();

	return `${slug}-${randomString}`;
}

function generateRandomString() {
	return Math.random().toString(36).substring(2, 8);
}
