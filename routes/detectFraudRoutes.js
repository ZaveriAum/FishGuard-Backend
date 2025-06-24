const express = require('express');

const detectFraudController = require('../controllers/detectFraudController');
const router = express.Router();

router.post('/', detectFraudController.getSiteContent);

module.exports = router;