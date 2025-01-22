const router = require('express').Router();
const { exec } = require('child_process');
const axios = require('axios');
const { config } = require('../config');



let serverProcess = false;
router.post('/start-server', async (req, res) => {
  console.log('Received request to start server');
  const { type } = req.body;

  if (!type || !config[type]) {
      return res.status(400).json({ success: false, message: 'Invalid server type' });
  }

  const options = { cwd: 'A:\\Vlinder\\Uranium_cli\\bin' };
   const data = config[type];
  // First check if server is already running
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
          console.log('Quranium Server starting...');
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
          console.log('Server started, beginning blockchain sync check...');
          pollBlockchainInfo({ 
              checkCommand: 'quranium-cli.exe --testnet getblockchaininfo',
              RPC_CHECK_URL: data.RPC_CHECK_URL 
          }, options, res);
      }, 4000);
  });

});

const pollBlockchainInfo = async (data, options, res) => {
  console.log('Starting blockchain polling...');
  let isResponseSent = false;

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
                  console.log('Blockchain is synced!');
                  clearInterval(syncInterval);
                  if (!isResponseSent) {
                      isResponseSent = true;
                      res.end(JSON.stringify({ success: true, syncing: false, message: 'Blockchain is fully synced!' }));
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



router.get('/test-connection', (req, res) => {
  const options = { cwd: 'A:\\Vlinder\\Uranium_cli\\bin' };
  exec('quranium-cli.exe --version', options, (error, stdout, stderr) => {
      res.json({
          success: !error,
          output: stdout,
          error: error ? error.message : null,
          stderr: stderr
      });
  });
}); 
router.get('/stop-server', async (req, res) => {
  console.log('Received request to stop server');

  const options = { cwd: 'A:\\Vlinder\\Uranium_cli\\bin' };

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
