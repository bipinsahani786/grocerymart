import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

let s3Client = null;

export const getS3Client = () => {
  if (!s3Client && process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

export const uploadToCloudflare = async (fileBuffer, mimetype, originalName = 'image.png', customKey = null) => {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
    throw new Error('Cloudflare R2 environment variables are not configured in backend/.env');
  }

  const client = getS3Client();
  if (!client) {
    throw new Error('Failed to initialize Cloudflare R2 S3 client');
  }

  let key = customKey;
  if (!key) {
    const ext = originalName && originalName.includes('.') ? originalName.split('.').pop() : 'png';
    const filename = `${crypto.randomUUID()}-${Date.now()}.${ext}`;
    key = `uploads/${filename}`;
  }

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype || 'application/octet-stream',
  });

  await client.send(command);

  // Return API proxy URL that fetches strictly from Cloudflare R2
  return `/api/upload/file/${key}`;
};
