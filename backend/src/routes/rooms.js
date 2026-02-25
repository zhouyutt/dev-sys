const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/auth');

// 所有房间路由都需要认证
router.use(authMiddleware);

// 获取所有房间
router.get('/', roomController.getAllRooms);

// 获取房间状态概览
router.get('/status', roomController.getRoomStatus);

// 获取单个房间
router.get('/:id', roomController.getRoomById);

// 创建房间
router.post('/', roomController.createRoom);

// 更新房间
router.put('/:id', roomController.updateRoom);

// 覆盖设置房间住客
router.post('/:id/students', roomController.setRoomStudents);

// 删除房间
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
