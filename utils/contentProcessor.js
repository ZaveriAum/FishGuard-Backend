const cheerio = require('cheerio');

// clean html body content
function cleanContent(html) {
  const $ = cheerio.load(html);
  return $.text().toLowerCase().trim();
}

// Extract URLs from text
function extractUrls(text) {
  const regex = /(https?:\/\/[^\s"'<>()]+)/g;
  return text.match(regex) || [];
}

module.exports = { cleanContent, extractUrls };
