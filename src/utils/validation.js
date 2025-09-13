const { URL } = require('url');
const axios = require('axios');
const contentDisposition = require('content-disposition');
const { UPLOAD } = require('../../config');

const BLOCKED_DOMAINS = [
  'malicious-site-for-example.com',
  'adult-content-site.com',
  'and-so-on.com'
  // we can add more as needed
];

async function validateUrl(url) {
  try {
    const temp = new URL(url);

    const domain = temp.hostname;
    if (BLOCKED_DOMAINS.includes(domain)) {
      throw new Error('Links from this domain are not allowed');
    }

    // In production, use a service like Google Safe Browsing
    await axios.head(url, { timeout: 5000 });
  } catch (error) {
    throw new Error(`Invalid or unsafe URL: ${error.message}`);
  }
}

async function validateImage(imageUrl) {
  try {
    await validateUrl(imageUrl);

    const response = await axios.head(imageUrl, { timeout: 5000 });
    const contentType = response.headers['content-type'];
    const contentLength = parseInt(contentType, 10);

    if (!UPLOAD.ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new Error(`Image type ${contentType} is not allowed`);
    }

    if (contentLength > UPLOAD.MAX_FILE_SIZE) {
      throw new Error(`Image size must be less than ${UPLOAD.MAX_FILE_SIZE}MB`);
    }

    if (response.headers['content-disposition']) {
      const filename = contentDisposition.parse(response.headers['content-disposition']).parameters.filename;
      if (filename) {
        const extension = filename.split('.').pop().toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
          throw new Error('Invalid image file extension');
        }
      }
    }
  } catch (error) {
    throw new Error(`Invalid image: ${error.message}`);
  }
}

module.exports = {
  validateUrl,
  validateImage
};