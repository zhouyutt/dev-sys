const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置Multer用于护照上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/passports');
    // 确保目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'passport-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// 公开路由，无需认证
router.get('/qrcode', enrollmentController.getEnrollmentQRCode);
router.post('/qrcode/generate', enrollmentController.generateEnrollmentQRCode);
router.post('/submit', enrollmentController.submitEnrollment);
router.post('/upload-passport', upload.single('passport'), enrollmentController.uploadPassport);

module.exports = router;
