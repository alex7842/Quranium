const dotenv=require('dotenv');
dotenv.config();

 const  config = {
    //MAIN
    '1': {
        RPC_CHECK_URL: process.env.MAIN_RPC_CHECK_URL,
        checkCommand: process.env.MAIN_CHECK_COMMAND,
        startCommand: process.env.MAIN_EXECUTE_COMMAND
    },
    '2': {
        RPC_CHECK_URL: process.env.TEST_RPC_CHECK_URL,
        checkCommand: process.env.TEST_CHECK_COMMAND,
        startCommand: process.env.TEST_EXECUTE_COMMAND
    }
};

module.exports = { config };