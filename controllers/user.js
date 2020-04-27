'use strict';

require('dotenv').config();

const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

exports.register = (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  let password = req.body.password;
  const password2 = req.body.confirmPassword;

  if (!username || !password || !password2) {
    req.flash('error', 'Please, fill in all the fields.');
    res.redirect('register');
    return;
  }

  if (password !== password2) {
    req.flash('error', 'Passwords entered do not match. Please enter your password again.');
    res.redirect('register');
    return;
  }

  User.findOne({ username: username })
    .then(data => {
      if (data) {
        req.flash('error', 'user already exists');
        res.redirect('register');
      } else {
        password = bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS, 10));
        let document = new User({
          username,
          email,
          password
        });
        return document.save();
      }
    })
    .then(() => {
      res.redirect('login');
    })
    .catch(err => {
      req.flash('error', err.message);
      res.redirect('register');
    });
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
