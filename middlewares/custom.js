'use strict';

const { check, validationResult } = require('express-validator');
const User = require('../models/user');


exports.registerValidationsRules = [
  check('username').isLength({ min: 3, max: 20 }).withMessage('Invalid url length')
    .custom(value => {
      return User.findOne({ username: value })
        .then(data => {
          if (data) {
            Promise.reject('That {username} is already in our system');
          }
          return true;
        })
        .catch(error => {
          Promise.reject(error);
        });
    })
    .trim().escape(),
  check('email').isEmail()
    .custom(value => {
      return User.findOne({ email: value })
        .then(data => {
          if (data) {
            Promise.reject('That {email} is already in our system');
          }
          return true;
        })
        .catch(error => {
          Promise.reject(error);
        });
    }).normalizeEmail(),
  check('password').isLength({ min: 5, max: 20 }).withMessage('Password mut be between 5 and 10 characters')
    .custom((value, { req /*, loc, path */ }) => {
      if (value !== req.body.confirmPassword) {
        // trow error if passwords do not match
        throw new Error('Passwords don\'t match');
      } else {
        return true;
      }
    })
];

exports.registerValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  req.flash('error', extractedErrors.join('.<br>'));
  return res.redirect('register');
};

exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user.username || null;
    return next();
  } else {
    console.log('not authenticated');
  }
  req.flash('error', 'authentication failure, please login again.');
  res.redirect('login');
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (error, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  // render the error page
  res.status(error.status || 500);
  res.render('500');
};

// goes last!!
exports.notFoundHandler = (req, res) => {
  res.status(400);
  res.render('404', { title: '404: File Not Found' });
};
