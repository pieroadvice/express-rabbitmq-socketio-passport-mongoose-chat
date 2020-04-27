'use strict';

require('dotenv').config();

const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

exports.register = (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  let password = req.body.password;
  password = bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS, 10));
  let document = new User({
    username,
    email,
    password
  });
  document.save();
  res.redirect('login');
};

exports.login = (req, res) => {
  passport.authenticate('local', (error, user) => {
    if (error || !user) {
      req.flash('error', 'username or password not correct.');
      res.redirect('login');
    } else {
      req.logIn(user, (err) => {
        if (err) {
          req.flash('error', 'error creating the session please try again.');
          res.redirect('login');
        }
        // console.log('===========', req.session.passport.user.username);
        res.redirect('chatroom');
      });
    }
  })(req, res);
};

exports.showRegister = (req, res) => {
  res.render('register.jade', { title: 'Register' });
};

exports.showlogin = (req, res) => {
  res.render('login.jade', { title: 'log in' });
};
