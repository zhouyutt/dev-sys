const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authMiddleware } = require('../middleware/auth');

// 所有员工路由都需要认证
router.use(authMiddleware);

// 获取所有员工
router.get('/', staffController.getAllStaff);

// 获取可用教练列表
router.get('/instructors/available', staffController.getAvailableInstructors);

// 获取单个员工
router.get('/:id', staffController.getStaffById);

// 创建员工
router.post('/', staffController.createStaff);

// 更新员工
router.put('/:id', staffController.updateStaff);

// 删除员工
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
