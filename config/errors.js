'use strict';

const customMdw = require('../middlewares/custom');

module.exports = server => {
  server.use(customMdw.errorHandler);
  server.use(customMdw.notFoundHandler);
};
