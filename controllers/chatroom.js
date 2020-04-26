'use strict';

exports.unprotected = (req, res) => {
  res.send('Ok. unprotected route');
};

exports.chatroom = (req, res) => {
  res.render('chatroom.jade', { title: 'Chat' });
};

