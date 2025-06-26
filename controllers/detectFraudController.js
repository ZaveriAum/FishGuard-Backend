const { cleanContent, extractUrls } = require('../utils/contentProcessor');
const { checkWebRisk } = require('../controllers/phishCheck');

const detectFraudController = {
    getSiteContent: async (req, res) => {
        try {          
            const { body } = req.body;

            // const cleanBody = cleanContent(req.body);
            if (typeof body !== 'string') {
                return res.status(400).json({ error: 'Expected "content" to be a string in request body.' });
            }

            const urls = extractUrls(body);

            let responses = await Promise.all(
                urls.map(async (url) => {
                    return extractUrls(url); 
                })
            );

            res.status(200).json({responses });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
      

    getNewTabUrl : async (req, res) => {
        const { newUrl } = req.body;
        const response = await checkWebRisk(newUrl)
        console.log(response);
    }
}

module.exports = detectFraudController