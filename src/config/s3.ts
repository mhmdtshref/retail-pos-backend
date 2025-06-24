import { S3Client } from '@aws-sdk/client-s3';

// Validate AWS credentials
const validateCredentials = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;

  if (!accessKeyId || accessKeyId.trim() === '') {
    throw new Error('AWS_ACCESS_KEY_ID environment variable is required');
  }

  if (!secretAccessKey || secretAccessKey.trim() === '') {
    throw new Error('AWS_SECRET_ACCESS_KEY environment variable is required');
  }

  if (!region || region.trim() === '') {
    throw new Error('AWS_REGION environment variable is required');
  }

  if (!bucket || bucket.trim() === '') {
    throw new Error('AWS_S3_BUCKET environment variable is required');
  }

  return {
    accessKeyId,
    secretAccessKey,
    region,
    bucket,
  };
};

// Get validated credentials
const credentials = validateCredentials();

// Create S3 client
export const s3Client = new S3Client({
  region: credentials.region,
  credentials: {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
  },
});

// S3 bucket configuration
export const S3_CONFIG = {
  bucket: credentials.bucket,
  region: credentials.region,
  folder: 'items/', // Folder within the bucket for item images
};

// Generate unique filename
export const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${S3_CONFIG.folder}${timestamp}-${randomString}.${extension}`;
};

// Generate S3 URL
export const generateS3Url = (fileName: string): string => {
  return `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${fileName}`;
}; 