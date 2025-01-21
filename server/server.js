
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverRoutes = require('./routes/server');
const walletRoutes = require('./routes/wallet');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/server', serverRoutes);
app.use('/wallet', walletRoutes);

app.listen(3001, () => console.log('Server running on port 3001'));






// const express = require('express');
// const { exec } = require('child_process');
// const bodyParser = require('body-parser');
// const cors=require('cors');

// const axios = require('axios');
// const { config } = require('./config/index');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// let serverStarted = false;

// app.post('/start-server', (req, res) => {
//     console.log('Received request to start server');
//     const {type} =req.body;
    
//     const data=config[type];
//     console.log(data);
    
//     const options = {
//         cwd: 'A:\\Vlinder\\Uranium_cli\\bin'
//     };
    
//   // Checking
//     exec('quranium-cli.exe getblockchaininfo', options, (error, stdout, stderr) => {
//         if (!error) {
//             serverStarted = true;
//             console.log(' Server is already running and ready!');
//             return res.send({ success: true, message: 'Server is already running!' });
//         }
        
//         // start server
//         const startProcess = exec('quraniumd.exe', options);
        
       
//         startProcess.stdout.on('data', (data) => {
//             console.log(' Quranium Server starting...');
//             console.log(' Server Output:', data);
//         });

      
//         setTimeout(() => {
//             serverStarted = true;
         
//             res.send({ success: true, message: 'Server started successfully!' });
//         }, 2000);

//         startProcess.stderr.on('error', (error) => {
//             if (!error.message.includes('already running')) {
//                 console.error(` Error: ${error.message}`);
//                 res.status(500).send({ success: false, message: error.message });
//             }
//         });
//     });
// });




// app.post('/send-funds', async (req, res) => {
//     const { account, amount } = req.body;

//     if (!account || !amount) {
//         return res.status(400).send({ success: false, message: 'Account and amount are required' });
//     }

//     const url = 'http://135.225.108.170:15010/wallet/alice';
//     const auth = {
//         username: 'stagingqrnnode',
//         password: 'qrnnode@123'
//     };

//     const payload = {
//         jsonrpc: '1.0',
//         id: 'sendtoaddress',
//         method: 'sendtoaddress',
//         params: [account, amount],
//     };

//     try {
//         const response = await axios.post(url, payload, {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             auth: auth
//         });

//         if (response.data.error) {
//             return res.status(400).send({ success: false, message: response.data.error.message });
//         }

//         res.send({ success: true, data: response.data.result });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send({ success: false, message: 'RPC call failed', error: error.message });
//     }
// });

// app.get('/stopserver', async (req, res) => {
//     try {
      
//       exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
//         if (error) {
//           return res.json({
//             success: false,
//             message: 'Failed to stop server'
//           });
//         }
        
//         res.json({
//           success: true,
//           message: 'Server stopped successfully'
//         });
//       });
//     } catch (error) {
//       res.json({
//         success: false, 
//         message: error.message
//       });
//     }
//   });
  

  

// // Start the backend server
// app.listen(3001, () => console.log('Backend server running on port 3001'));
