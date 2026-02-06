const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authMiddleware } = require('../middleware/auth');

// 获取明天的行程（公开，用于大屏展示）
router.get('/tomorrow', tripController.getTomorrowTrips);

// 以下路由需要认证
router.use(authMiddleware);

// 获取所有行程
router.get('/', tripController.getAllTrips);

// 获取单个行程
router.get('/:id', tripController.getTripById);

// 创建行程
router.post('/', tripController.createTrip);

// 更新行程
router.put('/:id', tripController.updateTrip);

// 删除行程
router.delete('/:id', tripController.deleteTrip);

// 添加参与者到行程
router.post('/:id/participants', tripController.addParticipant);

// 从行程中移除参与者
router.delete('/:id/participants', tripController.removeParticipant);

module.exports = router;
