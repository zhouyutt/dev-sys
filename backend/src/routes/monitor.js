const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取系统概览（需要monitor:read权限）
router.get('/overview', requirePermission('monitor:read'), monitorController.getSystemOverview);

// 获取在线用户
router.get('/online-users', requirePermission('monitor:read'), monitorController.getOnlineUsers);

// 获取登录日志
router.get('/login-logs', requirePermission('monitor:read'), monitorController.getLoginLogs);

// 获取操作日志
router.get('/operation-logs', requirePermission('monitor:read'), monitorController.getOperationLogs);

// 获取系统日志
router.get('/system-logs', requirePermission('monitor:read'), monitorController.getSystemLogs);

module.exports = router;
