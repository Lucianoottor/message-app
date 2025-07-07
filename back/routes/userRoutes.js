// /routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const Middleware = require('../http/authMiddleware');


router.post('/register', userController.createUser);

router.post('/login', userController.loginUser);

router.get('/search', Middleware.authMiddleware, userController.searchUsers);

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUserById);



module.exports = router;
