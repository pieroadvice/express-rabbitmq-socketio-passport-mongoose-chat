'use strict';

const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'the username is required'],
    minlength: 2,
    maxlength: 50,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'the email is required'],
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'the password is required'],
    minlength: 5,
    maxlength: 1024
  }
});

module.exports = model('User', userSchema);

