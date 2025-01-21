const router = require('express').Router();
const { exec } = require('child_process');
const { config } = require('../config');

let serverStarted = false;

router.post('/start-server', (req, res) => {
    console.log('Received request to start server');
    const { type } = req.body;
    const data = config[type];
    const options = {
        cwd: 'A:\\Vlinder\\Uranium_cli\\bin'
    };
    
  // Checking
    exec('quranium-cli.exe getblockchaininfo', options, (error, stdout, stderr) => {
        if (!error) {
            serverStarted = true;
            console.log(' Server is already running and ready!');
            return res.send({ success: true, message: 'Server is already running!' });
        }
        
        // start server
        const startProcess = exec('quraniumd.exe', options);
        
       
        startProcess.stdout.on('data', (data) => {
            console.log(' Quranium Server starting...');
            console.log(' Server Output:', data);
        });

      
        setTimeout(() => {
            serverStarted = true;
         
            res.send({ success: true, message: 'Server started successfully!' });
        }, 2000);

        startProcess.stderr.on('error', (error) => {
            if (!error.message.includes('already running')) {
                console.error(` Error: ${error.message}`);
                res.status(500).send({ success: false, message: error.message });
            }
        });
    });
   
});

router.get('/stop-server',async (req, res) => {
    console.log('Received request to stop server');
    try {
      
        exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
          if (error) {
            return res.json({
              success: false,
              message: 'Failed to stop server'
            });
          }
          
          res.json({
            success: true,
            message: 'Server stopped successfully'
          });
          console.log('server stopped');
          
        });
      } catch (error) {
        res.json({
          success: false, 
          message: error.message
        });
      }
});

module.exports = router;
