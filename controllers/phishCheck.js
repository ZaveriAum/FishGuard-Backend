const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
require('dotenv/config');

// service account credentials
const auth = new GoogleAuth({
  keyFile: "./controllers/hackthebrainproj-7ee8f140e85e.json",
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});


// use web risk api

async function checkWebRisk(sourcePageUrlParam, sourcePageTitleParam, malURL) {
    try {
        const client = await auth.getClient()
        const accessToken = await client.getAccessToken()
        
        console.log('Project ID:', await auth.getProjectId())
        console.log('Token exists:', !!accessToken.token)
         
        // web risk api
        const response = await axios.get(
            `https://webrisk.googleapis.com/v1/uris:search?uri=${encodeURIComponent(malURL)}&threatTypes=SOCIAL_ENGINEERING&threatTypes=MALWARE&threatTypes=UNWANTED_SOFTWARE`,
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
        const risk = safe ? 'safe'.toUpperCase() : 'malicious'.toUpperCase()
        const threats = data?.threat?.threatTypes || []
        
        
        response_body = {
            "clickedUrl": malURL,
            "sourcePageUrl": sourcePageUrlParam,
            "sourcePageTitle": sourcePageTitleParam,
            "riskIndicators": threats,
            "webRiskVerdict": risk
        }
        console.log(response_body)

        const {
            clickedUrl,
            sourcePageUrl,
            sourcePageTitle,
            riskIndicators,
            webRiskVerdict,
        } = response_body.body;

        const markdown = await generateRiskExplanation({
            clickedUrl,
            sourcePageUrl,
            sourcePageTitle,
            riskIndicators: riskIndicators.join(', '),
            webRiskVerdict,
            sourceSnippet
        });
  
        // Simple Markdown-to-JSON parser
        const lines = markdown.split('\n');
        const extract = (header) => {
            const idx = lines.findIndex(l => l.startsWith(`**${header}:**`));
            if (idx === -1) return '';
            let text = lines[idx].replace(`**${header}:**`, '').trim();
            for (let i = idx + 1; i < lines.length && !lines[i].startsWith('**'); i++) {
            text += ' ' + lines[i].trim();
            }
            return text.trim();
        };
  
        const safetyTipsBlock = extract('Safety Tips');
        const safetyTips = safetyTipsBlock
            .split('\n')
            .map(l => l.replace(/^-\s*/, '').trim())
            .filter(Boolean);
    
        res.json({
            riskSummary:    extract('Risk Summary'),
            detailedReason: extract('Detailed Reason'),
            nextSteps:      extract('Next Steps'),
            safetyTips
        });
        
        
    } catch (err) {
        console.error('Error details:', err.response?.data || err.message)
        return null
    }
}

module.exports = { checkWebRisk }