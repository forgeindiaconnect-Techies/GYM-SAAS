import multer from 'multer';
import path from 'path';
import fs from 'fs';

const resumesDir = path.join(__dirname, '../../uploads/resumes');
fs.mkdirSync(resumesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumesDir);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `resume_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safe}`);
  },
});

export const resumeUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const isDocExt = file.originalname.match(/\.(pdf|doc|docx)$/i);
    const isDocMime = allowedMimes.includes(file.mimetype);

    // Reject all images, screenshots, and unsupported files
    if (file.mimetype.startsWith('image/') || file.originalname.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i)) {
      return cb(new Error('Screenshots and image files are not accepted. Only PDF (.pdf) and Word documents (.doc, .docx) are allowed as resumes.'));
    }

    if (isDocMime || isDocExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document format. Only PDF (.pdf) and Word documents (.doc, .docx) up to 10MB are allowed for resumes.'));
    }
  },
});
