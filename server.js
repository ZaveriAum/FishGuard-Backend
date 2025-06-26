const app = require('./app')
const SERVER_PORT = process.env.SERVER_PORT || 5000 


app.get('/', (req, res) => {
    res.send("Hello FishGuard")
})

// listing at port 5000
app.listen(SERVER_PORT, () => {
    console.log(`Server listening to http://localhost:${SERVER_PORT}`)
})