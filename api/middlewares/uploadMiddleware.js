const multer = require('multer');
const path = require('path');
const { ApiError } = require('./errorMiddleware');

const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
const postsUploadsDir = path.join(__dirname, '../uploads/posts');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(postsUploadsDir)) {
  fs.mkdirSync(postsUploadsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const postImagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `post-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Invalid file format. Only images (.png, .jpg, .jpeg, .gif, .webp) are allowed.'));
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const uploadPostImages = multer({
  storage: postImagesStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = uploadAvatar;
module.exports.uploadAvatar = uploadAvatar;
module.exports.uploadPostImages = uploadPostImages;
