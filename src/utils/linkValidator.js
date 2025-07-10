const { URL } = require('url');
const axios = require('axios');

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

module.exports = {
  validateUrl
};