const { URL } = require('url');
const axios = require('axios');
const contentDisposition = require('content-disposition');

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

const BLOCKED_DOMAINS = [
  'malicious-site-for-example.com',
  'adult-content-site.com',
  'and-so-on.com'
  // we can add more as needed
];

async function validateUrl(url) {
  try {
    new URL(url); // Throws if invalid URL

    const domain = new URL(url).hostname;
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
    const contentLength = parseInt(response.headers['content-length'], 10);

    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      throw new Error(`Image type ${contentType} is not allowed`);
    }

    // max size is 5MB
    if (contentLength > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
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