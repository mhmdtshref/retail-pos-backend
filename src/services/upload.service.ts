import { Request } from 'express';
import multer from 'multer';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_CONFIG, generateFileName, generateS3Url } from '../config/s3';
import { AppError } from '../utils/error';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload single image
export const uploadSingleImage = upload.single('image');

// Upload multiple images
export const uploadMultipleImages = upload.array('images', 10); // Max 10 images

// Upload file to S3
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  try {
    const fileName = generateFileName(file.originalname);
    
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await s3Client.send(command);
    
    return generateS3Url(fileName);
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new AppError('Failed to upload file to S3', 500);
  }
};

// Process upload result
export const processUploadResult = async (req: Request): Promise<{ imageUrl: string }> => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const imageUrl = await uploadToS3(req.file);
  
  return {
    imageUrl,
  };
};

// Process multiple upload results
export const processMultipleUploadResults = async (req: Request): Promise<{ imageUrls: string[] }> => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const files = req.files as Express.Multer.File[];
  const uploadPromises = files.map(file => uploadToS3(file));
  const imageUrls = await Promise.all(uploadPromises);

  return {
    imageUrls,
  };
};

// Delete file from S3
export const deleteFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    // Extract key from URL
    const urlParts = imageUrl.split('/');
    const key = urlParts.slice(3).join('/'); // Remove protocol, bucket, and region

    const command = new DeleteObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new AppError('Failed to delete file from S3', 500);
  }
}; 