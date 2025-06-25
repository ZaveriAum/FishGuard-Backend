const detectFraudController = {
    getSiteContent : async (req, res) => {
        console.log(req.body)
    },

    getNewTabUrl : async (req, res) => {
        const { newUrl } = req.body;
        console.log( {newUrl })
    }
}

module.exports = detectFraudController