const { processContent } = require('../controllers/contentController');
const { checkWebRisk } = require('../controllers/phishCheck');

const detectFraudController = {
    getSiteContent : async (req, res) => {
        const { content, url } = processContent(req, res)
        const response = await checkWebRisk(url)
        console.log(response);
    },

    getNewTabUrl : async (req, res) => {
        const { newUrl } = req.body;
        const response = await checkWebRisk(newUrl)
        console.log(response);
    }
}

module.exports = detectFraudController