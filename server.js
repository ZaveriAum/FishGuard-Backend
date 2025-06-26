const app = require('./app')
const { checkWebRisk } = require('./controllers/phishCheck')
const SERVER_PORT = process.env.SERVER_PORT || 5050 
// const { cors } = require('cors')

// app.use(cors())

app.get('/', (req, res) => {
    res.send("Hello FishGuard")
})

// listing at port 5000
app.listen(SERVER_PORT, () => {
    console.log(`Server listening to http://localhost:${SERVER_PORT}`)
})

// checkWebRisk("hi", "title", "malware.testing.google.test/testing/malware/")
