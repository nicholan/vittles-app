import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { count, eq, sql, inArray } from "drizzle-orm";
import type { ApiContextProps } from "../context";
import { favorites, follows, images, posts, reblogs, users } from "../db/schema";

export async function getInteractionsAndMedia<T extends { postId: number }>(ctx: ApiContextProps, q: T[]) {
	const postIds = q.map((post) => post.postId);

	const [interactions, postsWithMedia] = await Promise.all([
		countInteractions(ctx, postIds),
		withMedia(ctx, postIds),
	]);

	const interactionsMap = new Map(interactions.map((interaction) => [interaction.postId, interaction]));

	// Merge media details with interaction counts
	const mergedPosts = q.map((post) => {
		const interactions = interactionsMap.get(post.postId);

		return {
			...post,
			favoritesCount: interactions?.favoritesCount || 0,
			commentsCount: interactions?.commentsCount || 0,
			reblogsCount: interactions?.reblogsCount || 0,
			files: postsWithMedia.find((media) => media.postId === post.postId)?.files || [],
		};
	});

	return mergedPosts;
}

async function countInteractions(ctx: ApiContextProps, postIds: number[]) {
	// Query interaction counts for the given post IDs
	const [favoritesCounts, commentsCounts, reblogsCounts] = await Promise.all([
		ctx.db
			.select({ postId: favorites.postId, count: count() })
			.from(favorites)
			.where(inArray(favorites.postId, postIds))
			.groupBy(favorites.postId),

		ctx.db
			.select({ rootPostId: posts.rootPostId, count: count() })
			.from(posts)
			.where(inArray(posts.rootPostId, postIds))
			.groupBy(posts.rootPostId),

		ctx.db
			.select({ postId: reblogs.postId, count: count() })
			.from(reblogs)
			.where(inArray(reblogs.postId, postIds))
			.groupBy(reblogs.postId),
	]);

	// Convert the results to a map for easy lookup
	const favoritesMap = new Map(favoritesCounts.map((row) => [row.postId, row.count]));
	const commentsMap = new Map(commentsCounts.map((row) => [row.rootPostId, row.count]));
	const reblogsMap = new Map(reblogsCounts.map((row) => [row.postId, row.count]));

	// Create the interaction data
	return postIds.map((postId) => ({
		postId,
		favoritesCount: favoritesMap.get(postId) || 0,
		commentsCount: commentsMap.get(postId) || 0,
		reblogsCount: reblogsMap.get(postId) || 0,
	}));
}

// Function to fetch and presign all image URLs for a given post array.
async function withMedia(ctx: ApiContextProps, postIds: number[]) {
	if (postIds.length === 0) return [];

	// Query all images related to the post IDs
	const allImages = await ctx.db.select().from(images).where(inArray(images.postId, postIds));

	// Sign all R2 bucket URLs in one go
	const signed = await signUrls(ctx, allImages);

	const imgs = signed.map((image) => {
		const { size, url, width, height, mime, postId, id } = image;
		return {
			id,
			size,
			url,
			width,
			height,
			mime,
			postId,
		};
	});

	// Create a map of postId to images
	const imagesMap = new Map<number, typeof imgs>();

	for (const image of imgs) {
		// Get the array of images for the postId, or initialize it if it doesn't exist
		const postImages = imagesMap.get(image.postId) || [];
		postImages.push(image);
		imagesMap.set(image.postId, postImages);
	}

	return postIds.map((postId) => ({
		postId,
		files: imagesMap.get(postId) || [],
	}));
}

async function signUrls<T extends { key: string }>(ctx: ApiContextProps, files: T[]) {
	return await Promise.all(
		files.map(async (file) => {
			const url = await signGetUrl(ctx, file.key);
			return {
				...file,
				url,
			};
		}),
	);
}

async function signGetUrl(ctx: ApiContextProps, key: string) {
	const command = new GetObjectCommand({
		Bucket: ctx.env.R2_BUCKET_NAME,
		Key: key,
	});

	return await getSignedUrl(ctx.r2, command, { expiresIn: 3600 });
}
