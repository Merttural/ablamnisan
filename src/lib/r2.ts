import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

export function r2Ready(): boolean {
  return readR2Config() !== null;
}

export function openR2(): { client: S3Client; bucket: string } | null {
  const config = readR2Config();
  if (!config) {
    return null;
  }
  return { client: r2Client(config), bucket: config.bucket };
}

let client: S3Client | null = null;

function readR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function r2Client(config: R2Config): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
}

/** Signed PUT for the original bytes. The body is not read or re-encoded here. */
export async function signOriginalUpload(input: {
  objectKey: string;
  contentType: string;
}): Promise<string | null> {
  const config = readR2Config();
  if (!config) {
    return null;
  }
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: input.objectKey,
    ContentType: input.contentType,
  });
  return getSignedUrl(r2Client(config), command, { expiresIn: 60 * 60 });
}

export async function originalByteSize(objectKey: string): Promise<number | null> {
  const config = readR2Config();
  if (!config) {
    return null;
  }
  try {
    const head = await r2Client(config).send(
      new HeadObjectCommand({ Bucket: config.bucket, Key: objectKey }),
    );
    return typeof head.ContentLength === "number" ? head.ContentLength : null;
  } catch (error) {
    console.error("R2 head failed", error instanceof Error ? error.name : "unknown");
    return null;
  }
}

export async function writeMemoryRecord(objectKey: string, record: unknown): Promise<boolean> {
  const config = readR2Config();
  if (!config) {
    return false;
  }
  try {
    await r2Client(config).send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
        Body: JSON.stringify(record),
        ContentType: "application/json",
      }),
    );
    return true;
  } catch (error) {
    console.error("R2 record failed", error instanceof Error ? error.name : "unknown");
    return false;
  }
}
