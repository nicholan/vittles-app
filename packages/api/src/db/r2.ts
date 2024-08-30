import { S3Client } from "@aws-sdk/client-s3";
import type { Bindings } from "../worker";

export const createStorageClient = ({ R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, ACCOUNT_ID }: Bindings) => {
	return new S3Client({
		region: "auto",
		endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: R2_ACCESS_KEY_ID,
			secretAccessKey: R2_SECRET_ACCESS_KEY,
		},
	});
};
