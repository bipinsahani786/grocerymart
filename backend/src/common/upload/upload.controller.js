import { S3Client, PutObjectCommand, GetObjectCommand, PutBucketCorsCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { catchAsync } from "../../utils/catchAsync.js";
import { uploadToCloudflare, getS3Client as getCloudflareClient } from "../../utils/cloudflare.js";

let s3Client;
let bucketChecked = false;

const getS3Client = () => {
  if (!s3Client) {
    s3Client = getCloudflareClient() || new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return s3Client;
};

/**
 * Attempts to automatically create R2 bucket and set CORS rules if token has permissions
 */
const ensureBucketAndCors = async (client) => {
  if (bucketChecked) return;
  try {
    await client.send(new CreateBucketCommand({ Bucket: process.env.R2_BUCKET_NAME }));
  } catch (err) {
    // Bucket likely already exists
  }

  try {
    await client.send(
      new PutBucketCorsCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "POST", "HEAD", "DELETE"],
              AllowedOrigins: ["*"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );
  } catch (err) {
    // CORS configuration restricted
  }
  bucketChecked = true;
};

/**
 * Direct file upload strictly to Cloudflare R2
 */
export const directUpload = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const url = await uploadToCloudflare(req.file.buffer, req.file.mimetype, req.file.originalname);
  res.status(200).json({
    success: true,
    data: { url, public_url: url },
    message: "File uploaded to Cloudflare R2 successfully",
  });
});

/**
 * Streams files directly from Cloudflare R2 bucket with high-performance HTTP caching
 */
export const getFileFromR2 = catchAsync(async (req, res) => {
  let key = req.params.key || req.params[0] || '';
  if (Array.isArray(key)) key = key.join('/');
  key = key.replace(/^\/+/, '');

  if (!key) {
    return res.status(400).json({ success: false, message: "File key is required" });
  }

  const client = getS3Client();
  if (!client) {
    return res.status(500).json({ success: false, message: "Cloudflare R2 client not initialized" });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const response = await client.send(command);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    if (response.ContentType) {
      res.setHeader("Content-Type", response.ContentType);
    }
    if (response.ContentLength) {
      res.setHeader("Content-Length", response.ContentLength);
    }
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    if (typeof response.Body.pipe === 'function') {
      response.Body.pipe(res);
    } else {
      const buffer = await response.Body.transformToByteArray();
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    // Fallback: try key without leading "uploads/" if failed
    try {
      if (key.startsWith('uploads/')) {
        const altKey = key.replace(/^uploads\//, '');
        const command = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: altKey,
        });
        const response = await client.send(command);
        if (response.ContentType) res.setHeader("Content-Type", response.ContentType);
        if (response.ContentLength) res.setHeader("Content-Length", response.ContentLength);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        if (typeof response.Body.pipe === 'function') {
          return response.Body.pipe(res);
        } else {
          const buffer = await response.Body.transformToByteArray();
          return res.send(Buffer.from(buffer));
        }
      }
    } catch (err2) {
      // Ignore fallback error
    }

    console.error("Cloudflare R2 GetObject error for key:", key, error?.message || error);
    res.status(404).json({ success: false, message: "File not found on Cloudflare R2" });
  }
});

/**
 * Presigned URL generation for client-side uploads directly to Cloudflare R2
 */
export const getPresignedUrl = catchAsync(async (req, res) => {
  const { folder = "uploads", extension = "png", contentType = "image/png" } = req.body;
  const client = getS3Client();

  await ensureBucketAndCors(client);

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
  const path = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: path,
  });

  const upload_url = await getSignedUrl(client, command, { expiresIn: 900 });
  const public_url = `${process.env.R2_PUBLIC_DOMAIN}/${path}`;

  res.status(200).json({
    success: true,
    data: {
      upload_url,
      path,
      public_url,
    },
    message: "Presigned URL generated successfully",
  });
});
