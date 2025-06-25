const express = require('express');
const detectFraudRoutes = require('./routes/detectFraudRoutes')
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/detect-fraud', detectFraudRoutes)

module.exports = app;