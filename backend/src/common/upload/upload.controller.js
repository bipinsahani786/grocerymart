import { S3Client, PutObjectCommand, PutBucketCorsCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { catchAsync } from "../../utils/catchAsync.js";

let s3Client;
let bucketChecked = false;

const getS3Client = () => {
  if (!s3Client) {
    s3Client = new S3Client({
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
