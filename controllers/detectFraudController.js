const { cleanContent, extractUrls } = require('../utils/contentProcessor');
const { checkWebRisk } = require('../controllers/phishCheck');

const detectFraudController = {
    getSiteContent: async (req, res) => {
        try {          
            const cleanBody = cleanContent(req.body);
            const urls = extractUrls(req.body);
            let responses = await Promise.all(
                urls.rows.map(async (url)=> {
                    return await extractUrls(url)
                })
            );
            for(let i = 0 ; i < responses.length ; i++){
                console.log(responses[i]);
            }
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