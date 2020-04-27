'use strict';

require('dotenv').config({ path: '../.env' });

const moment = require('moment');
const rabbitmq = require('../config/rabbitmq');
const stockbot = require('../services/stockbot');

exports.unprotected = (req, res) => {
  res.send('Ok. unprotected route');
};

exports.chatroom = (req, res) => {
  res.render('chatroom.jade', { title: 'Chat' });
};

exports.sendMessage = (req, res) => {
  rabbitmq.connection((conn) => {
    conn.createChannel((err, ch) => {
      if (err) {
        throw new Error(err);
      }
      let options = {
        durable: true,
        maxLength: parseInt(process.env.QUEUE_MSGS_LIMIT, 10),
        arguments: { 'x-max-length': parseInt(process.env.QUEUE_MSGS_LIMIT, 10) }
      };
      let ex = process.env.EXCHANGE_NAME;
      let q = process.env.QUEUE_NAME;
      // some cleaning
      req.body.message = req.body.message.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, '');
      req.body.time = moment().format('DD/MM/YYYY HH:mm:ss');
      let message = req.body.message;
      let msg = JSON.stringify(req.body);

      ch.assertExchange(ex, 'fanout', { durable: false });
      ch.publish(ex, '', new Buffer(msg), { persistent: false });
      ch.assertQueue(q, options);
      ch.sendToQueue(q, new Buffer(msg), { persistent: true });
      let stock = /\/stock=([^\s]+)/.exec(message);
      if (stock && stock.length) {
        stockbot.service(stock[1], ch, () => {
          ch.close(() => {
            conn.close();
          });
          res.json(true);
        });
      } else {
        ch.close(() => {
          conn.close();
        });
        res.json(true);
      }
    });
  });
};

// get last N(10) messages from the secondary queue created just for this purpose
exports.getMessages = (req, res) => {
  rabbitmq.connection((conn) => {
    conn.createChannel((err0, ch) => {
      if (err0) {
        throw new Error(err0);
      }

      let q = process.env.QUEUE_NAME;
      let options = {
        durable: true,
        maxLength: parseInt(process.env.QUEUE_MSGS_LIMIT, 10),
        arguments: { 'x-max-length': parseInt(process.env.QUEUE_MSGS_LIMIT, 10) }
      };
      ch.assertQueue(q, options, (err, status) => {
        if (err) {
          throw new Error(err);
        } else if (status.messageCount === 0) {
          res.send('{"messages": 0}');
        } else {
          let numChunks = 0;

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write('{"messages": [');

          ch.consume(q.que, (msg) => {
            let resChunk = msg.content.toString();

            res.write(resChunk);
            ++numChunks;
            if (numChunks < status.messageCount) {
              res.write(',');
            }

            if (numChunks === status.messageCount) {
              res.write(']}');
              res.end();
              ch.close(() => {
                conn.close();
              });
            }
          });
        }
      });
    }, { noAck: true });
  });
};
