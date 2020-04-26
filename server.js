'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
global.appRoot = path.resolve(__dirname);

let app = express();
require('./config/server')(app);
require('./config/mongoose');
require('./config/passport')(app);
require('./config/routes')(app);
require('./config/errors')(app);

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`express server listening on port ${port}`);
});

