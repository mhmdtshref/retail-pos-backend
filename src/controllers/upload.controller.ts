import { Request, Response, NextFunction } from 'express';
import { uploadSingleImage, uploadMultipleImages, processUploadResult, processMultipleUploadResults } from '../services/upload.service';

export class UploadController {
  // Upload single image
  uploadSingle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use multer middleware
      uploadSingleImage(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        try {
          const result = await processUploadResult(req);
          
          res.status(200).json({
            status: 'success',
            data: result,
          });
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Upload multiple images
  uploadMultiple = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use multer middleware
      uploadMultipleImages(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        try {
          const result = await processMultipleUploadResults(req);
          
          res.status(200).json({
            status: 'success',
            data: result,
          });
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  };
} 