'use strict';

require('dotenv').config();

const mongoose = require('mongoose');

module.exports = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};


