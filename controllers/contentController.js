const { cleanContent, extractUrls } = require('../utils/contentProcessor');

const processContent = (req, res) => {
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Missing content.' });
  }

  const cleanBody = cleanContent(body);
  const urls = extractUrls(body);

  res.json({
    cleanBody,
    urls
  });
};

module.exports = { processContent };
