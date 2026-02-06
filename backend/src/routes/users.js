const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取所有用户（需要user:read权限）
router.get('/', requirePermission('user:read'), userController.getAllUsers);

// 获取单个用户
router.get('/:id', requirePermission('user:read'), userController.getUserById);

// 创建用户（需要user:write权限）
router.post('/', requirePermission('user:write'), userController.createUser);

// 更新用户（需要user:write权限）
router.put('/:id', requirePermission('user:write'), userController.updateUser);

// 删除用户（需要user:delete权限）
router.delete('/:id', requirePermission('user:delete'), userController.deleteUser);

// 重置密码（需要user:write权限）
router.post('/:id/reset-password', requirePermission('user:write'), userController.resetPassword);

module.exports = router;
