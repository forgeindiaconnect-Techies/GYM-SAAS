import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configure Cloudinary with user credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'renugopal',
  api_key: process.env.CLOUDINARY_API_KEY || '689648734199335',
  api_secret: process.env.CLOUDINARY_API_SECRET || '1nOqAdAkjpR6ofkcKiK8uFeYWYE',
  secure: true
});

// Multer Storage Engine for Cloudinary uploads
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    const folder = isVideo ? 'gym_saas/videos' : 'gym_saas/images';
    const resourceType = isVideo ? 'video' : 'auto';

    return {
      folder,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'webm', 'pdf'],
      public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`
    };
  }
});

// Configured Multer Uploader
export const uploadCloud = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos and high-res media
  }
});

/**
 * Direct file path uploader to Cloudinary
 */
export const uploadFileToCloudinary = async (
  filePath: string,
  folder = 'gym_saas/general',
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
) => {
  return cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType
  });
};

/**
 * Direct base64 or data URI uploader to Cloudinary
 */
export const uploadBase64ToCloudinary = async (
  dataUri: string,
  folder = 'gym_saas/images'
) => {
  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'auto'
  });
};

/**
 * Upload memory buffer directly to Cloudinary with smart fallback
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  filename: string,
  mimetype: string,
  folder = 'gym_saas/messages'
): Promise<any> => {
  let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto';
  if (mimetype.startsWith('image/')) {
    resourceType = 'image';
  } else if (mimetype.startsWith('video/')) {
    resourceType = 'video';
  } else if (mimetype.startsWith('audio/')) {
    resourceType = 'video';
  } else {
    resourceType = 'raw';
  }

  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const publicId = `${Date.now()}-${cleanName}`;

  const attemptUpload = (rType: 'auto' | 'image' | 'video' | 'raw') => {
    return new Promise<any>((resolve, reject) => {
      const uploadOptions: any = {
        folder,
        resource_type: rType,
        public_id: publicId
      };
      if (rType === 'raw') {
        uploadOptions.use_filename = true;
      }
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
      stream.end(buffer);
    });
  };

  return attemptUpload(resourceType).catch((_firstErr) => {
    if (resourceType !== 'raw') {
      return attemptUpload('raw');
    }
    throw _firstErr;
  });
};

export default cloudinary;

