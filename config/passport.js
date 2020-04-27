'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const session = require('express-session');
const flash = require('connect-flash');

module.exports = server => {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, (username, password, done) => {
    User.findOne({ username: username })
      .then(data => {
        if (data === null) {
          // user does not exist 
          return done(null, false);
        } else if (!bcrypt.compareSync(password, data.password)) {
          // wrong password
          return done(null, false);
        }
        return done(null, data); // ok
      })
      .catch(err => done(err, null)); // DB error
  }));
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  server.use(session({
    secret: 'secret secret secret',
    resave: false,
    saveUninitialized: false
  }));
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(flash());
  server.use((req, res, next) => {
    res.locals.errorMessage = req.flash('error');
    next();
  });
};
