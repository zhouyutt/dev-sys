const express = require('express');
const router = express.Router();
const displayController = require('../controllers/displayController');

// 获取今日按岛屿分组的行程
router.get('/trips-by-island', displayController.getTodayTripsByIsland);

// 获取实时房间状态
router.get('/rooms-status', displayController.getRoomsStatus);

module.exports = router;
