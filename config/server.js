/* eslint-disable no-undef */
'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

module.exports = (server, appRoot) => {
  server.set('view engine', 'jade');
  server.set('views', path.join(appRoot, 'views'));
  server.locals.pretty = true;

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
  server.use(express.static(path.join(appRoot, 'public')));
};
