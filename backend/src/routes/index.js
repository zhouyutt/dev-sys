const express = require('express');
const router = express.Router();

// 导入所有路由
const authRoutes = require('./auth');
const studentRoutes = require('./students');
const studentFormRoutes = require('./studentForm');
const roomRoutes = require('./rooms');
const boatRoutes = require('./boats');
const courseRoutes = require('./courses');
const staffRoutes = require('./staff');
const tripRoutes = require('./trips');
const equipmentRoutes = require('./equipment');
const qrcodeRoutes = require('./qrcode');
const displayRoutes = require('./display');
const enrollmentRoutes = require('./enrollment'); // 公开报名
const userRoutes = require('./users'); // 用户管理
const roleRoutes = require('./roles'); // 角色管理
const permissionRoutes = require('./permissions'); // 权限管理
const menuRoutes = require('./menus'); // 菜单管理
const monitorRoutes = require('./monitor'); // 系统监控

// 注册路由
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/student-form', studentFormRoutes);
router.use('/rooms', roomRoutes);
router.use('/boats', boatRoutes);
router.use('/courses', courseRoutes);
router.use('/staff', staffRoutes);
router.use('/trips', tripRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/qrcode', qrcodeRoutes);
router.use('/display', displayRoutes);
router.use('/enrollment', enrollmentRoutes); // 公开报名，无需认证
router.use('/users', userRoutes); // 用户管理
router.use('/roles', roleRoutes); // 角色管理
router.use('/permissions', permissionRoutes); // 权限管理
router.use('/menus', menuRoutes); // 菜单管理
router.use('/monitor', monitorRoutes); // 系统监控

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Service is running normally',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
