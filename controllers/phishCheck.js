const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
require('dotenv/config');
const { generateThreatReport } = require('../utils/fishGuardLLM');


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
        console.log("WEBRISK", data)
        console.log("WEBRISK", url)
        const safe = Object.keys(data).length === 0
        const risk = safe ? 'safe'.toUpperCase() : 'malicious'.toUpperCase()
        const threats = data?.threat?.threatTypes || []
        
        // console.log(response_body)

        return {
            url: url,
            threats: data?.threat?.threatTypes || [],
        };
        
        
    } catch (err) {
        console.error('Error details:', err.response?.data || err.message)
        return null
    }
}


async function checkAllUrls(urls) {
    const results = await Promise.all(
        urls.map(url => checkWebRisk(url))
    );

    return results.filter(result => result !== null);
}

async function generateConsolidatedReport({ maliciousLinks, sourcePageUrl, sourcePageTitle }) {
    const markdown = await generateThreatReport({
        maliciousLinks,
        sourcePageUrl,
        sourcePageTitle
    });

    const lines = markdown.replace(/```json|```/g, '').trim().split('\n');
    let jsonString = lines.join('');
    
    try {
        const parsedJson = JSON.parse(jsonString);
        return { parsedJson, "isMalicious": true };
    } catch (error) {
        console.error("Failed to parse JSON from LLM response:", error);
        console.error("Raw LLM response:", jsonString);
        return {
            riskSummary: "An error occurred while generating the report.",
            detailedReason: "The AI model returned a response that could not be understood.",
            nextSteps: "Please try again later.",
            safetyTips: []
        };
    }
}


module.exports = { checkAllUrls, generateConsolidatedReport, checkWebRisk};

