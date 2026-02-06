const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware } = require('../middleware/auth');

// 获取所有课程（公开，用于报名页面）
router.get('/', courseController.getAllCourses);

// 获取单个课程（公开）
router.get('/:id', courseController.getCourseById);

// 以下路由需要认证
router.use(authMiddleware);

// 创建课程
router.post('/', courseController.createCourse);

// 更新课程
router.put('/:id', courseController.updateCourse);

// 删除课程
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
