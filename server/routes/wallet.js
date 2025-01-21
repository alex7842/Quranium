const router = require('express').Router();
const axios = require('axios');

router.post('/send-funds', async (req, res) => {
    const { account, amount } = req.body;
       
       if (!account || !amount) {
            return res.status(400).send({ success: false, message: 'Account and amount are required' });
        }
    
        const url = 'http://135.225.108.170:15010/wallet/alice';
        const auth = {
            username: 'stagingqrnnode',
            password: 'qrnnode@123'
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
