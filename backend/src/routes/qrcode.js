const express = require('express');
const router = express.Router();
const qrcodeController = require('../controllers/qrcodeController');
const { authMiddleware } = require('../middleware/auth');

// 生成报名二维码（需要认证）
router.get('/enrollment', authMiddleware, qrcodeController.generateEnrollmentQRCode);

// 生成自定义二维码（需要认证）
router.post('/custom', authMiddleware, qrcodeController.generateCustomQRCode);

module.exports = router;
