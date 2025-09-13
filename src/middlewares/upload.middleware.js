const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { UPLOAD } = require('../../config');
const { generateFileName, validateFile } = require('../utils/fileUpload');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD.DIR);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  try {
    validateFile(file);
    cb(null, true);
  } catch (err) {
    cb(new Error(`File validation failed: ${err.message}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
    files: UPLOAD.MAX_IMAGES_PER_POST
  }
}).array('images', UPLOAD.MAX_IMAGES_PER_POST);

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          error: `File too large. Maximum size is ${UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB` 
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          error: `Too many files. Maximum ${UPLOAD.MAX_IMAGES_PER_POST} images allowed` 
        });
      }
      if (err.message.includes('File validation failed')) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: 'File upload failed' });
    }
    
    req.files = req.files || [];
    next();
  });
};