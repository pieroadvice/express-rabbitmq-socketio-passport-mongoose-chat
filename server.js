'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const { Server } = require('http');
const server = new Server(app);
const io = require('socket.io')(server);

require('./config/server')(app, path.resolve(__dirname));
require('./config/mongoose')();
require('./config/passport')(app);
require('./config/rabbitmq').setup(io);
require('./config/routes')(app);
require('./config/errors')(app);


let port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Chat server listening on port ${port}`);
});
// server.listen(3030, '0.0.0.0', () => {
//   console.log('Chat at localhost:3030');
// });
process.stderr.on('data', (data) => {
  console.log(data);
});
process.on('unhandledRejection', (err) => {
  console.log('======================= unhandledRejection =======================', err);
  process.exit(1);
});

