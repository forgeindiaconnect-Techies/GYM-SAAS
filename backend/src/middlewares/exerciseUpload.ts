import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(__dirname, '../../uploads/exercises');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
    cb(null, `exercise_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeBase}${ext}`);
  },
});

export const exerciseMediaUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for exercise videos
  fileFilter: (_req, file, cb) => {
    const isVideo = file.mimetype.startsWith('video/');
    const isImage = file.mimetype.startsWith('image/');
    if (isVideo || isImage) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed (MP4, WebM, GIF, JPG, PNG, WebP)'));
    }
  },
});
