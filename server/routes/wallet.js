const router = require('express').Router();
const axios = require('axios');
const { config } = require('../config');
router.post('/send-funds', async (req, res) => {
    const { account, amount,type } = req.body;
  //  console.log("type",type);
       const data=config[type];
     //  console.log("wallet",data);
       if (!account || !amount) {
            return res.status(400).send({ success: false, message: 'Account and amount are required' });
        }
    
        const url = `http://${data.TEST_WALLET_USER}:${data.TEST_WALLET_PASSWORD}@${data.TEST_WALLET_HOST}:${data.TEST_WALLET_PORT}/wallet/${data.TEST_WALLET_NAME}`;
      //  console.log(url);
        const auth = {
            username: data.TEST_WALLET_USER,
            password:data.TEST_WALLET_PASSWORD
        };
    
        const payload = {
            jsonrpc: '1.0',
            id: 'sendtoaddress',
            method: 'sendtoaddress',
            params: [account, amount],
        };
    
        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: auth
            });
    
            if (response.data.error) {
                return res.status(400).send({ success: false, message: response.data.error.message });
            }
            res.send({ success: true, data: response.data.result });
        } catch (error) {
            console.error(error.message);
            res.status(500).send({ success: false, message: 'RPC call failed', error: error.message });
        }
});

module.exports = router;
