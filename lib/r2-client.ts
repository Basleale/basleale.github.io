import { S3Client } from "@aws-sdk/client-s3";

const accountId = "4zn9I5zfRk2zGI0MG33koQ21fbFrFwrCrJGg4LS3";
const accessKeyId = "aaac981d15929b598f5014d8592a7bb3";
const secretAccessKey = "c604128022c2180a84057904a8c6a19172d26bc96540c81ab19397e20039864b";

export const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_BUCKET_NAME = "media";
export const R2_PUBLIC_URL = "https://pub-6a5367f94b86467a9be9828985ba8b18.r2.dev";

// Helper function to stream SDK response body to a string
export const streamToString = (stream: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });