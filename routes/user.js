'use strict';

const { Router } = require('express');
const customMdw = require('../middlewares/custom');
const ChatroomController = require('../controllers/chatroom');
const UserController = require('../controllers/user');

const router = new Router();
router.get('/login', UserController.showlogin);
router.post('/login', UserController.login);
router.get('/register', UserController.showRegister);
router.post('/register', customMdw.registerValidationsRules, customMdw.registerValidate, UserController.register);
router.get('/chatroom', customMdw.ensureAuthenticated, ChatroomController.chatroom);
router.post('/chatroom/messages', customMdw.ensureAuthenticated, ChatroomController.sendMessage);
router.get('/chatroom/messages', customMdw.ensureAuthenticated, ChatroomController.getMessages);


module.exports = router;
