const express = require('express');

const detectFraudController = require('../controllers/detectFraudController');
const router = express.Router();

router.post('/', detectFraudController.getSiteContent);
router.post('/get-new-tab-url', detectFraudController.getNewTabUrl)

module.exports = router;