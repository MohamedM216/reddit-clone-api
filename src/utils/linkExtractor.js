const { URL } = require('url');

// extract urls and return only the valid ones
function extractLinks(content) {
  if (!content) return [];
  
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  const links = content.match(urlRegex) || [];
  
  const validLinks = [];
  for (const link of links) {
    try {
      const url = new URL(link);
      if (['http:', 'https:'].includes(url.protocol)) {
        validLinks.push({
          url: url.href,
          domain: url.hostname
        });
      }
    } catch (e) {
      continue;
    }
  }
  
  return validLinks;
}

async function storePostLinks(postId, content, client = null) {
  const links = extractLinks(content);
  
  // Use the provided client for transaction or create a new query
  const queryMethod = client ? client.query : require('../utils/db').query;
  
  for (const link of links) {
    await queryMethod(
      'INSERT INTO post_links (post_id, url) VALUES ($1, $2)',
      [postId, link.url]
    );
  }
}

module.exports = {
  extractLinks,
  storePostLinks
};