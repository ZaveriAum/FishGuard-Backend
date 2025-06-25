const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
require('dotenv/config');

// service account credentials
const auth = new GoogleAuth({
  keyFile: "./controllers/hackthebrainproj-7ee8f140e85e.json",
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});


// use web risk api

async function checkWebRisk(url) {
    try {
        const client = await auth.getClient()
        const accessToken = await client.getAccessToken()
        
        console.log('Project ID:', await auth.getProjectId())
        console.log('Token exists:', !!accessToken.token)
         
        // web risk api
        const response = await axios.get(
            `https://webrisk.googleapis.com/v1/uris:search?uri=${encodeURIComponent(url)}&threatTypes=SOCIAL_ENGINEERING&threatTypes=MALWARE&threatTypes=UNWANTED_SOFTWARE`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`
                }
            }
        )
        // if empty link is safe
        // otherwise will be list of threats
        data = response.data
        console.log(data)
        const safe = Object.keys(data).length === 0
        const risk = safe ? 'safe' : 'malicious'
        const threats = data?.threat?.threatTypes || []

        response_data = {
            message: "Got response from web risk api",
            data: data,
            risk_level: risk,
            threats: threats,
            is_safe: safe
        }



        return response_data
    } catch (err) {
        console.error('Error details:', err.response?.data || err.message)
        return null
    }
}

module.exports = { checkWebRisk }