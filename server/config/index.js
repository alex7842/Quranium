const dotenv=require('dotenv');
dotenv.config();

 const  config = {
    //MAIN
    '1': {
     
        checkCommand: process.env.MAIN_CHECK_COMMAND,
        startCommand: process.env.MAIN_EXECUTE_COMMAND,
        RPC_CHECK_URL_USER: process.env.MAIN_RPC_CHECK_URL_USER,
        RPC_CHECK_URL_PASSWORD: process.env.MAIN_RPC_CHECK_URL_PASSWORD,
        RPC_CHECK_URL_PORT: process.env.MAIN_RPC_CHECK_URL_PORT,
        RPC_CHECK_URL_HOST: process.env.MAIN_RPC_CHECK_URL_HOST,
    
        WALLET_USER: process.env.MAIN_WALLET_USER,
        WALLET_PASSWORD: process.env.MAIN_WALLET_PASSWORD,
        WALLET_PORT: process.env.MAIN_WALLET_PORT,
        WALLET_HOST: process.env.MAIN_WALLET_HOST,
        WALLET_NAME: process.env.MAIN_WALLET_NAME,
        PATH: process.env.CLI_PATH


    },
    '2': {
      //  RPC_CHECK_URL: process.env.TEST_RPC_CHECK_URL,
        checkCommand: process.env.TEST_CHECK_COMMAND,
        startCommand: process.env.TEST_EXECUTE_COMMAND,
        RPC_CHECK_URL_USER: process.env.TEST_RPC_CHECK_URL_USER,
        RPC_CHECK_URL_PASSWORD: process.env.TEST_RPC_CHECK_URL_PASSWORD,
        RPC_CHECK_URL_PORT: process.env.TEST_RPC_CHECK_URL_PORT,
        RPC_CHECK_URL_HOST: process.env.TEST_RPC_CHECK_URL_HOST,
        WALLET_USER: process.env.TEST_WALLET_USER,
        WALLET_PASSWORD: process.env.TEST_WALLET_PASSWORD,
        WALLET_PORT: process.env.TEST_WALLET_PORT,
        WALLET_HOST: process.env.TEST_WALLET_HOST,
        WALLET_NAME: process.env.TEST_WALLET_NAME,
        PATH: process.env.CLI_PATH


    }
};

module.exports = { config };