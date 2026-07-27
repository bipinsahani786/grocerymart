import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadToCloudflare = async (fileBuffer, mimetype, originalName) => {
  const extension = originalName.split('.').pop();
  const filename = `${crypto.randomUUID()}-${Date.now()}.${extension}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: filename,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  return `${process.env.R2_PUBLIC_DOMAIN}/${filename}`;
};
