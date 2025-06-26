const { extractUrls } = require('../utils/contentProcessor');
const { checkAllUrls, generateConsolidatedReport } = require('../controllers/phishCheck');

const detectFraudController = {
    getSiteContent: async (req, res) => {
        try {
            const { content, url: sourcePageUrl, title: sourcePageTitle } = req.body;

            if (typeof content !== 'string') {
                return res.status(400).json({ error: 'Expected "content" to be a string in request body.' });
            }

            let urls = extractUrls(content);
            if (!urls || urls.length === 0) {
                return res.status(200).json({ message: "No links found to analyze." });
            }
            urls = ["http://testsafebrowsing.appspot.com/s/malware.html"]
             

            const maliciousLinks = await checkAllUrls(urls);
            if (maliciousLinks.length === 0) {
                return res.status(200).json({ 
                    summary: "All links appear to be safe.",
                    threats: [] 
                });
            }
            // console.log("!!!!!!!!!!!!!!!!Running generateConsolidatedReport")

            const report = await generateConsolidatedReport({
                maliciousLinks,
                sourcePageUrl,
                sourcePageTitle,
            });

            console.log(report)
            res.status(200).json({ "parsedJson": report.parsedJson, "isMalicious": report.isMalicious});

        } catch (err) {
            console.error("Error in getSiteContent:", err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getNewTabUrl: async (req, res) => {
        try {
            const { newUrl } = req.body;
            const maliciousLinks = await checkAllUrls([newUrl]);

            if (maliciousLinks.length === 0) {
                return res.status(200).json({ summary: "Link appears to be safe.", threats: [] });
            }
            
            // console.log("!!!!!!!!!!!!!!!!Running generateConsolidatedReport")
            const report = await generateConsolidatedReport({
                maliciousLinks,
                sourcePageUrl: "Direct check (new tab)",
                sourcePageTitle: "User opened a new tab",
            });
            
            res.status(200).json(report);
        } catch(err) {
            console.error("Error in getNewTabUrl:", err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = detectFraudController;