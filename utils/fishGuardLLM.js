// fhishguardLLM.js
'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Retry function with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && attempt < maxRetries) {
        // Rate limit error - wait with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

// Try multiple models with fallback
async function tryModels(prompt) {
  const models = [
    "gemini-1.5-flash",  // Fastest, different rate limits
    "gemini-1.5-pro",    // Fallback if flash fails
    "gemini-2.0-flash-exp" // Experimental fallback
  ];

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`Successfully used model: ${modelName}`);
        return text;
      }
    } catch (error) {
      console.log(`Model ${modelName} failed: ${error.message}`);
      if (modelName === models[models.length - 1]) {
        // Last model failed, throw the error
        throw error;
      }
      // Try next model
      continue;
    }
  }
  
  throw new Error('All models failed');
}

async function generateRiskExplanation({
  clickedUrl,
  sourcePageUrl,
  sourcePageTitle,
  riskIndicators,
  webRiskVerdict,
  sourceSnippet
}) {
  const prompt = `
You are PhishGuard, an AI security assistant that helps users understand suspicious links they click on.

## Context
- User clicked on the link: ${clickedUrl}
- The link was found on the source page: ${sourcePageUrl} (Page title: "${sourcePageTitle}").
- The phishing detection model found these risk indicators: ${riskIndicators}.
- Google Web Risk API says: ${webRiskVerdict}.
- Additional text context where the link was found: "${sourceSnippet}".

## Instructions
1. Analyze this information step-by-step.
2. Provide a short, clear **risk summary** in plain language (1–2 sentences).
3. Provide a **detailed reason** explaining why this link may be risky, referring to the source page, domain, suspicious patterns, and any unusual context.
4. Provide **practical next steps** for the user to stay safe right now.
5. Provide **1–2 short safety tips** to help avoid such links in the future.
6. Write in a friendly, helpful tone — avoid overly technical jargon.

## Output format (use markdown):
**Risk Summary:**
...

**Detailed Reason:**
...

**Next Steps:**
...

**Safety Tips:**
- Tip 1
- Tip 2

---

Now, produce a helpful explanation based on the given context.
`.trim();

  try {
    return await retryWithBackoff(async () => {
      return await tryModels(prompt);
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate explanation: ${error.message}`);
  }
}

module.exports = { generateRiskExplanation }; 