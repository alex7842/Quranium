const dotenv=require('dotenv');
dotenv.config();

 const  config = {
    //MAIN
    '1': {
     
        checkCommand: process.env.MAIN_CHECK_COMMAND,
        startCommand: process.env.MAIN_EXECUTE_COMMAND,
        MAIN_RPC_CHECK_URL_USER: process.env.MAIN_RPC_CHECK_URL_USER,
        MAIN_RPC_CHECK_URL_PASSWORD: process.env.MAIN_RPC_CHECK_URL_PASSWORD,
        MAIN_RPC_CHECK_URL_PORT: process.env.MAIN_RPC_CHECK_URL_PORT,
        MAIN_RPC_CHECK_URL_HOST: process.env.MAIN_RPC_CHECK_URL_HOST,
    
        MAIN_WALLET_USER: process.env.MAIN_WALLET_USER,
        MAIN_WALLET_PASSWORD: process.env.MAIN_WALLET_PASSWORD,
        MAIN_WALLET_PORT: process.env.MAIN_WALLET_PORT,
        MAIN_WALLET_HOST: process.env.MAIN_WALLET_HOST,
        MAIN_WALLET_NAME: process.env.MAIN_WALLET_NAME,
        PATH: process.env.CLI_PATH


    },
    '2': {
      //  RPC_CHECK_URL: process.env.TEST_RPC_CHECK_URL,
        checkCommand: process.env.TEST_CHECK_COMMAND,
        startCommand: process.env.TEST_EXECUTE_COMMAND,
        TEST_RPC_CHECK_URL_USER: process.env.TEST_RPC_CHECK_URL_USER,
        TEST_RPC_CHECK_URL_PASSWORD: process.env.TEST_RPC_CHECK_URL_PASSWORD,
        TEST_RPC_CHECK_URL_PORT: process.env.TEST_RPC_CHECK_URL_PORT,
        TEST_RPC_CHECK_URL_HOST: process.env.TEST_RPC_CHECK_URL_HOST,
        TEST_WALLET_USER: process.env.TEST_WALLET_USER,
        TEST_WALLET_PASSWORD: process.env.TEST_WALLET_PASSWORD,
        TEST_WALLET_PORT: process.env.TEST_WALLET_PORT,
        TEST_WALLET_HOST: process.env.TEST_WALLET_HOST,
        TEST_WALLET_NAME: process.env.TEST_WALLET_NAME,
        PATH: process.env.CLI_PATH


    }
};

module.exports = { config };