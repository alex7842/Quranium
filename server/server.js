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



