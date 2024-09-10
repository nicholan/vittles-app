import * as crypto from "node:crypto";
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fileTypeFromBuffer } from "file-type";
import { imageDimensionsFromData } from "image-dimensions";
import * as v from "valibot";
import type { ApiContextProps } from "../context";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { protectedProcedure, router } from "../trpc";
import { streamToBuffer } from "../utils/streamToBuffer";

type Attachment = {
	id: string;
	url: string;
	key: string;
	extension: string;
	mime: string;
	width: number;
	height: number;
	size: number;
};

type FileUploadProps = {
	key: string;
	ext: string;
};

const filesSchema = v.object({
	count: v.pipe(v.number(), v.minValue(1), v.maxValue(4)),
});

export const fileRouter = router({
	getPresignedUrls: protectedProcedure
		.input((raw) => v.parse(filesSchema, raw))
		.query(async ({ ctx, input }) => {
			const urls = [];
			try {
				for (let i = 0; i < input.count; i++) {
					const key = crypto.randomUUID() as string;

					const url = await getSignedUrl(
						ctx.r2,
						new PutObjectCommand({
							Bucket: ctx.env.R2_BUCKET_NAME,
							Key: key,
						}),
					);

					urls.push({ url, key });
				}

				return urls;
			} catch (e) {
				console.error(e);
			}
			return urls;
		}),
});

export async function handleFileUpload(ctx: ApiContextProps, files: FileUploadProps[]) {
	const { r2 } = ctx;
	const { R2_BUCKET_NAME } = ctx.env;
	const { R2_WEB_ENDPOINT } = ctx.env;

	const attachments: Attachment[] = [];
	const allFileKeys = files.map((file) => file.key);

	try {
		for (const upload of files) {
			const uuid = crypto.randomUUID();
			const name = `${uuid}.${upload.ext}`;

			// Create a copy of the uploaded file.
			await r2.send(
				new CopyObjectCommand({
					Bucket: R2_BUCKET_NAME,
					CopySource: `${R2_BUCKET_NAME}/${upload.key}`,
					Key: name,
				}),
			);

			// Track the copied file key
			allFileKeys.push(name);

			// Delete the original file.
			r2.send(
				new DeleteObjectCommand({
					Bucket: R2_BUCKET_NAME,
					Key: upload.key,
				}),
			);

			// Get the copied file.
			const object = await r2.send(
				new GetObjectCommand({
					Bucket: R2_BUCKET_NAME,
					Key: name,
				}),
			);

			const buffer = await streamToBuffer(object.Body as ReadableStream);
			const [fileType, dimensions] = await Promise.all([
				fileTypeFromBuffer(buffer),
				imageDimensionsFromData(buffer),
			]);

			if (!fileType || !dimensions || upload.ext !== fileType.ext) {
				throw new Error("File type or dimensions are invalid.");
			}

			const { height, width } = dimensions;

			if (!object.ContentLength || [height, width].some((dim) => dim < 100 || dim > 5000)) {
				throw new Error("File size or dimensions are out of bounds.");
			}

			attachments.push({
				id: uuid,
				url: `${R2_WEB_ENDPOINT}/${name}`,
				key: name,
				extension: fileType.ext,
				mime: fileType.mime,
				width: dimensions.width,
				height: dimensions.height,
				size: object.ContentLength,
			});
		}
	} catch (error) {
		console.error(error);
		allFileKeys.map((key) => r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })));

		// Throw a TRPC error after cleaning up.
		throwTRPCErrorOnCondition(true, "BAD_REQUEST", "File", "Failed to upload file.");
	}

	return attachments;
}
