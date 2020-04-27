'use strict';

require('dotenv').config({ path: '../.env' });

const amqp = require('amqplib/callback_api');

const connection = cb => {
  amqp.connect(process.env.RABBITMQ_CONN, (err, conn) => {
    if (err) {
      throw new Error(err);
    }
    cb(conn);
  });
};

const setup = io => {
  let chat = io.of('/chat');
  let onlineUsers = {};
  chat.on('connection', (socket) => {
    socket.on('loginUser', username => {
      socket.username = username;
      onlineUsers[username] = socket.username;
      chat.emit('updateUsers', onlineUsers);
    });
    socket.on('disconnect', () => {
      if (socket.username && socket.username !== 'undefined') {
        delete onlineUsers[socket.username];
        chat.emit('updateUsers', onlineUsers);
      }
    });
  });
  connection(conn => {
    conn.createChannel((err0, ch) => {
      if (err0) {
        throw new Error(err0);
      }
      let ex = 'chat_ex';

      ch.assertExchange(ex, 'fanout', { durable: false });
      ch.assertQueue('', { exclusive: true }, (err1, q) => {
        if (err1) {
          throw new Error(err1);
        }
        ch.bindQueue(q.queue, ex, '');
        ch.consume(q.que, (msg) => {
          chat.emit('chat', msg.content.toString());
        });
      }, { noAck: true });
    });
  });
};

module.exports = {
  connection,
  setup
};
