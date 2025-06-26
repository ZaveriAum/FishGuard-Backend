const app = require('./app')
const SERVER_PORT = process.env.SERVER_PORT || 5000 
const cors = require('cors')
const { checkWebRisk } = require('./controllers/phishCheck.js')
const contentRoutes = require('./routes/contentRoutes');

app.use(cors())

app.get('/', (req, res) => {
    res.send("Hello FishGuard")
})

app.get('/check-link', async (req, res) => {
    // call web risk api
    try {
        const result = await checkWebRisk("http://malware.testing.google.test/testing/malware/")
        res.json({ data: result })
    } catch (err) {
        res.status(500).json({ error: "API call failed" })
    }
})

app.use('/api/content', contentRoutes);

// listing at port 5000
app.listen(SERVER_PORT, () => {
    console.log(`Server listening to http://localhost:${SERVER_PORT}`)
})