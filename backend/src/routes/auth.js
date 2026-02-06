const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validate, loginSchema } = require('../middleware/validator');

// 登录
router.post('/login', validate(loginSchema), authController.login);

// 获取当前用户信息（需要认证）
router.get('/me', authMiddleware, authController.me);

// 修改密码（需要认证）
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
