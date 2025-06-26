const express = require('express');
const detectFraudRoutes = require('./routes/detectFraudRoutes')
const { checkWebRisk } = require('./controllers/phishCheck.js')

const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/detect-fraud', detectFraudRoutes)

app.get('/check-link', async (req, res) => {
    // call web risk api
    try {
        const result = await checkWebRisk("http://malware.testing.google.test/testing/malware/")
        res.json({ data: result })
    } catch (err) {
        res.status(500).json({ error: "API call failed" })
    }
})

module.exports = app;