const express = require('express');
const router = express.Router();
const { processContent } = require('../controllers/contentController');

router.post('/process', processContent);

module.exports = router;
