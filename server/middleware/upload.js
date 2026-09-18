import multer from 'multer';
import AppError from '../utils/appError.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const ext = file.originalname.toLowerCase().split('.').pop();
  if (allowed.includes(`.${ext}`)) {
    return cb(null, true);
  }
  cb(new AppError('Only image files (jpg, jpeg, png, webp, gif, svg) are allowed', 400));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
