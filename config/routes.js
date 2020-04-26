'use strict';

const user_routes = require('../routes/user');

module.exports = server => {
  server.use('/', user_routes);
};
