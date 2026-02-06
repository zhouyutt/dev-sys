const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate, studentEnrollmentSchema } = require('../middleware/validator');

// 公开路由 - 学员报名
router.post('/enroll', validate(studentEnrollmentSchema), studentController.createStudent);

// 公开路由 - 上传护照并识别
router.post('/upload-passport', upload.single('passport'), studentController.uploadPassport);

// 需要认证的路由
router.use(authMiddleware);

// 获取所有学员
router.get('/', studentController.getAllStudents);

// 获取单个学员
router.get('/:id', studentController.getStudentById);

// 创建学员
router.post('/', studentController.createStudent);

// 更新学员
router.put('/:id', studentController.updateStudent);

// 删除学员
router.delete('/:id', studentController.deleteStudent);

// 分配房间
router.post('/:id/assign-room', studentController.assignRoom);

// 分配教练
router.post('/:id/assign-instructor', studentController.assignInstructor);

module.exports = router;
