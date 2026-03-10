const express = require('express');
const router = express.Router();
const studentFormController = require('../controllers/studentFormController');
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');

// 生成学生二维码（需要认证）
router.get('/:studentId/qrcode', authMiddleware, studentFormController.generateQRCode);

// 获取学生信息（公开）
router.get('/:studentId/info', studentFormController.getStudentInfo);

// 更新护照信息（公开）
router.put('/:studentId/passport', studentFormController.updatePassportInfo);

// 上传护照照片（公开）
router.post('/passport-photo', upload.single('passport'), studentFormController.uploadPassportPhoto);

module.exports = router;
