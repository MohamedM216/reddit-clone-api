const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { UPLOAD } = require('../../config');
const { mkdirp } = require('mkdirp');
const crypto = require('crypto');

const unlinkAsync = promisify(fs.unlink);
const renameAsync = promisify(fs.rename);

mkdirp.sync(UPLOAD.DIR);

function generateFileName(originalName) {
  const ext = path.extname(originalName);
  const randomString = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomString}${ext}`;
}

async function saveFile(file) {
  const fileName = generateFileName(file.originalname);
  const filePath = path.join(UPLOAD.DIR, fileName);
  
  await mkdirp(path.dirname(filePath));
  
  await renameAsync(file.path, filePath);
  
  return {
    fileName,
    filePath,
    mimeType: file.mimetype,
    size: file.size
  };
}

async function deleteFile(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await unlinkAsync(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') { // Only log if it's not a "file not found" error
      console.error('Error deleting file:', err);
    }
  }
}

function validateFile(file) {
  if (!UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} is not allowed`);
  }

  if (file.size > UPLOAD.MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
}

module.exports = {
  generateFileName,
  saveFile,
  deleteFile,
  validateFile
};