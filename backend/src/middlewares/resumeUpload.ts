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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx|jpg|jpeg|png)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word documents (.doc, .docx) or image files are allowed for resumes.'));
    }
  },
});
