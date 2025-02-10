const router = require('express').Router();
const { exec } = require('child_process');
const axios = require('axios');
const { config } = require('../config');

const fs = require('fs');

let serverProcess = false;



router.post('/start-server', async (req, res) => {
  console.log('Received request to start server');
 
  const { type } = req.body;
 // console.log("type start server",type);

  if (!type || !config[type]) {
      return res.status(400).json({ success: false, message: 'Invalid server type' });
  }
  

   const data = config[type];
   const options = { cwd:data.PATH };
   
  //const options = { cwd: 'A:\\Vlinder\\Uranium_cli\\bin' };
  // console.log(options)
   //console.log(data);
  // First check if server is already running



//   const configPath = 'C:\\Users\\USER\\AppData\\Local\\Quranium\\quranium.conf';
//     if (!fs.existsSync(configPath)) {
//         const configContent = `
// rpcuser=${data.TEST_RPC_CHECK_URL_USER}
// rpcpassword=${data.TEST_RPC_CHECK_URL_PASSWORD}
// server=1
// testnet=1
//         `;
//         fs.writeFileSync(configPath, configContent.trim());
//     }
  exec(data.checkCommand, options, (error, stdout, stderr) => {
      if (!error) {
          console.log('Server is already running and ready!');
          return res.json({ success: true, message: 'Server is already running!' });
      }

  


      // Set headers for streaming response
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Transfer-Encoding', 'chunked');

      // Start server
      const startProcess = exec(data.startCommand, options);

      startProcess.stdout.on('data', (data) => {
         // console.log('Quranium Server starting...');
          console.log('Server Output:', data);
          serverProcess=true;
      });

      startProcess.stderr.on('data', (data) => {
          console.log('Server stderr:', data);
      });

      startProcess.on('error', (error) => {
          if (!error.message.includes('already running')) {
              console.error(`Error: ${error.message}`);
              return res.status(500).json({ success: false, message: error.message });
          }
      });

      // Wait for server to start then begin polling
      setTimeout(() => {
         // console.log('Server started, beginning blocks sync check...');
          pollLocalBlocks(data, options, res);
      }, 4000);
  });

});

const getTargetBlocks=async (data) => {
    try {
        // Get RPC block info once
        const rpcResponse = await axios.post(
            data.RPC_CHECK_URL,
            {
                jsonrpc: '1.0',
                id: 'curltext',
                method: 'getblockchaininfo',
                params: [],
            },
            {
                auth: {
                    username: 'stagingqrnnode',
                    password: 'qrnnode@123',
                },
                headers: { 'Content-Type': 'application/json' },
            }
        );
  
        const rpcBlockInfo = rpcResponse.data.result;
        const targetBlocks = rpcBlockInfo.blocks;
        return targetBlocks;
    } catch (rpcError) {
        console.error('RPC Error:', rpcError.message);
        if (!isResponseSent) {
            isResponseSent = true;
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch RPC block details' }));
        }
    }
};

const pollLocalBlocks = async (data, options, res) => {
  //console.log('Starting blockchain polling...');
 // console.log(data);
  let isResponseSent = false;

  try {
    // Get RPC block info once
    const baseUrl = `http://${data.RPC_CHECK_URL_USER}:${data.RPC_CHECK_URL_PASSWORD}@${data.RPC_CHECK_URL_HOST}:${data.RPC_CHECK_URL_PORT}`
  // console.log('Base URL:', baseUrl);  
    const rpcResponse = await axios.post(
        baseUrl,
        {
            jsonrpc: '1.0',
            id: 'curltext',
            method: 'getblockchaininfo',
            params: [],
        },
        {
            auth: {
                username: data.RPC_CHECK_URL_USER,
                password: data.RPC_CHECK_URL_PASSWORD,
            },
            headers: { 'Content-Type': 'application/json' },
        }
    );

    const rpcBlockInfo = rpcResponse.data.result;
    const targetBlocks = rpcBlockInfo.blocks;
      console.log('Target RPC blocks:', targetBlocks);

      const syncInterval = setInterval(() => {
          exec(data.checkCommand, options, (error, stdout, stderr) => {

              if (error) {
                  console.error('Error fetching local block details:', error.message);
                  clearInterval(syncInterval);
                  
                  if (!isResponseSent) {
                      isResponseSent = true;
                      return res.end(JSON.stringify({ success: false, message: 'Failed to fetch local block details' }));
                  }
                  return;
              }

              const localBlockInfo = JSON.parse(stdout.trim());
             console.log('Local block info:', localBlockInfo);

              if (localBlockInfo.blocks >= targetBlocks) {
               //   console.log('Blocks synced!');
                  clearInterval(syncInterval);
                  if (!isResponseSent) {
                      isResponseSent = true;
                      res.end(JSON.stringify({ success: true, syncing: false, message: 'Blocks fully synced!',localBlocks:localBlockInfo.blocks,totalBlocks:targetBlocks }));
                  }
              } else {
                  const progress = `${localBlockInfo.blocks}/${targetBlocks}`;
                  console.log(`Sync progress: ${progress}`);
                  res.write(
                      JSON.stringify({
                          success: true,
                          syncing: true,
                          progress,
                          localBlocks: localBlockInfo.blocks,
                          totalBlocks: targetBlocks,
                      }) + '\n'
                  );
              }
          });
      }, 1000);

      // Timeout to prevent infinite polling
      setTimeout(() => {
          clearInterval(syncInterval);
          if (!isResponseSent) {
              isResponseSent = true;
              res.end(JSON.stringify({ success: false, message: 'Polling timeout reached' }));
          }
      }, 180000);

   } catch (rpcError) {
      console.error('RPC Error:', rpcError.message);
      if (!isResponseSent) {
          isResponseSent = true;
          res.end(JSON.stringify({ success: false, message: 'Failed to fetch RPC block details' }));
      }
  }
};


router.get('/stop-server', async (req, res) => {
  console.log('Received request to stop server');

  //const options = { cwd: 'A:\\Vlinder\\Uranium_cli\\bin' };
  const options = { cwd:process.env.CLI_PATH };

  // First try graceful shutdown
  exec('quranium-cli.exe --testnet stop', options, (error, stdout, stderr) => {
      console.log('Stop command output:', stdout || stderr);
      
      // Give it a moment to shutdown gracefully
      setTimeout(() => {
          // Force kill any remaining quranium processes
          exec('taskkill /F /IM quraniumd.exe', (err, out) => {
              if (err) {
                  console.log('No Quranium processes found');
              } else {
                  console.log('Killed remaining processes:', out);
              }
              
              serverProcess = false;
              res.json({
                  success: true,
                  message: 'Quranium server stopped successfully'
              });
          });
      }, 2000);
  });
});


module.exports = router;
