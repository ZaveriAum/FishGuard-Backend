require('dotenv/config');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.2,
  topK: 1,
  topP: 1,
  maxOutputTokens: 4096,
  response_mime_type: "application/json",
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];


async function generateThreatReport({
    maliciousLinks,
    sourcePageUrl,
    sourcePageTitle,
}) {
    const threatsFound = maliciousLinks.map((link, index) => 
        `${index + 1}. URL: ${link.url}\n   Threats: ${link.threats.join(', ')}`
    ).join('\n');

    const prompt = `
You are PhishGuard, an AI security assistant. Your task is to analyze a list of malicious links found on a webpage and generate a clear, helpful, and non-technical security report for the user.

## CONTEXT
- The user was on the page: "${sourcePageTitle}" (${sourcePageUrl}).
- My automated scan found the following ${maliciousLinks.length} suspicious link(s) on that page:
${threatsFound}

## INSTRUCTIONS
1.  Analyze the list of suspicious links and their associated threat types (e.g., SOCIAL_ENGINEERING, MALWARE).
2.  Provide a single, consolidated report in JSON format.
3.  The tone should be calm, helpful, and reassuring, not alarming.
4.  Do not use markdown in the JSON values. Use plain text.

## JSON OUTPUT STRUCTURE
Please provide your response as a single JSON object with the following structure:
{
  "riskSummary": "A very brief, 1-2 sentence summary of the findings. Start with a reassuring tone.",
  "detailedReason": "A paragraph explaining WHY these links are considered risky in simple terms. Mention the threat types found and what they mean (e.g., 'Social engineering means a site might try to trick you into giving away passwords'). Group the explanation if multiple links have the same threat type.",
  "nextSteps": "A clear, actionable list of 2-3 immediate steps the user should take to stay safe, like 'Don't click these links' or 'Close the suspicious browser tab'.",
  "safetyTips": [
    "A short, general safety tip to avoid future risks.",
    "Another short, general safety tip."
  ]
}
`.trim();

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig,
            safetySettings 
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;

    } catch (error) {
        console.error('Gemini API error:', error);
        const fallbackError = {
            riskSummary: "Could not generate a security report.",
            detailedReason: `An error occurred while contacting the AI security assistant: ${error.message}`,
            nextSteps: "The automated scan found potential risks, but the detailed analysis failed. It is safest to close the browser tab and avoid clicking any suspicious links.",
            safetyTips: ["Always be cautious of links from untrusted sources."]
        };
        return JSON.stringify(fallbackError, null, 2);
    }
}

module.exports = { generateThreatReport };