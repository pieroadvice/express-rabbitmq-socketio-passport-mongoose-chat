'use strict';

const { Router } = require('express');
const customMdw = require('../middlewares/custom');
const ChatroomController = require('../controllers/chatroom');
const UserController = require('../controllers/user');

const router = new Router();
router.get('/login', UserController.showlogin);
router.get('/register', UserController.showRegister);
router.post('/login', UserController.login);
router.post('/register', UserController.register);
router.get('/chatroom', customMdw.ensureAuthenticated, ChatroomController.chatroom);


module.exports = router;
