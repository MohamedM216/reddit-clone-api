require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '30d',
  SMTP_CONFIG: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  UPLOAD: {
    DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_IMAGES_PER_POST: parseInt(process.env.MAX_IMAGES_PER_POST || '10', 10),
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    ALLOWED_MIME_TYPES: (process.env.ALLOWED_MIME_TYPES || 'image/jpg,image/jpeg,image/png,image/gif,image/webp').split(',')
  }
};