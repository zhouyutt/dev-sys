const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取所有权限（需要permission:read权限）
router.get('/', requirePermission('permission:read'), permissionController.getAllPermissions);

// 获取单个权限
router.get('/:id', requirePermission('permission:read'), permissionController.getPermissionById);

// 创建权限（需要permission:write权限）
router.post('/', requirePermission('permission:write'), permissionController.createPermission);

// 更新权限（需要permission:write权限）
router.put('/:id', requirePermission('permission:write'), permissionController.updatePermission);

// 删除权限（需要permission:delete权限）
router.delete('/:id', requirePermission('permission:delete'), permissionController.deletePermission);

module.exports = router;
