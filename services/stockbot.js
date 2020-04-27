'use strict';

require('dotenv').config({ path: '../.env' });

const request = require('request');
const csv = require('csvtojson');

const service = (stock, rabbitMQChannel, cb) => {
  let ex = process.env.EXCHANGE_NAME;
  let q = process.env.QUEUE_NAME;
  csv()
    .fromStream(request.get(`https://stooq.com/q/l/?s=${stock}&f=sd2t2ohlcv&h&e=csv`))
    .then(csvRow => {
      let msg = {};
      msg.type = 'bot';
      msg.name = 'StockBot';
      // when there is no stock for the given param the result is N/D
      if (!csvRow || !Array.isArray(csvRow) || !csvRow.length || csvRow[0].Close === 'N/D') {
        msg.message = `Sorry there is no quote for ${csvRow[0].Symbol} `;
      } else {
        msg.message = `${csvRow[0].Symbol} quote is $${csvRow[0].Close} per share`;
      }
      msg = JSON.stringify(msg);
      rabbitMQChannel.publish(ex, '', new Buffer(msg), { persistent: false });
      rabbitMQChannel.sendToQueue(q, new Buffer(msg), { persistent: true });
      cb();
    });
};

module.exports = {
  service
};
