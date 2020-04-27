'use strict';

require('dotenv').config({ path: '../.env' });

const request = require('request');
const csv = require('csvtojson');
const rabbitmq = require('../config/rabbitmq');

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
      let message = req.body.message;
      let msg = JSON.stringify(req.body);

      ch.assertExchange(ex, 'fanout', { durable: false });
      ch.publish(ex, '', new Buffer(msg), { persistent: false });
      ch.assertQueue(q, options);
      ch.sendToQueue(q, new Buffer(msg), { persistent: true });
      let stock = /\/stock=([^\s]+)/.exec(message);
      if (stock && stock.length) {
        csv()
          .fromStream(request.get(`https://stooq.com/q/l/?s=${stock[1]}&f=sd2t2ohlcv&h&e=csv`))
          .then(csvRow => {
            msg = {};
            msg.type = 'bot';
            msg.name = 'StockBot';
            // when there is no stock for the given param the result is N/D
            if (csvRow[0].Close === 'N/D') {
              msg.message = `Sorry there are no values for ${csvRow[0].Symbol} `;
            } else {
              msg.message = `The closing value for ${csvRow[0].Symbol} on ${csvRow[0].Date} ${csvRow[0].Time} is ${csvRow[0].Close} `;
            }
            msg = JSON.stringify(msg);
            ch.publish(ex, '', new Buffer(msg), { persistent: false });
            ch.sendToQueue(q, new Buffer(msg), { persistent: true });
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
