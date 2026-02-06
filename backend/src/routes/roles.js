const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取所有角色（需要role:read权限）
router.get('/', requirePermission('role:read'), roleController.getAllRoles);

// 获取单个角色
router.get('/:id', requirePermission('role:read'), roleController.getRoleById);

// 创建角色（需要role:write权限）
router.post('/', requirePermission('role:write'), roleController.createRole);

// 更新角色（需要role:write权限）
router.put('/:id', requirePermission('role:write'), roleController.updateRole);

// 删除角色（需要role:delete权限）
router.delete('/:id', requirePermission('role:delete'), roleController.deleteRole);

module.exports = router;
