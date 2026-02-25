const express = require('express');
const router = express.Router();
const displayController = require('../controllers/displayController');

// 首页看板统计
router.get('/dashboard-stats', displayController.getDashboardStats);
// 每日统计（图表）
router.get('/daily-stats', displayController.getDailyStats);

// 获取今日按岛屿分组的行程
router.get('/trips-by-island', displayController.getTodayTripsByIsland);

// 获取实时房间状态
router.get('/rooms-status', displayController.getRoomsStatus);

module.exports = router;
