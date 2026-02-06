const express = require('express');
const router = express.Router();
const boatController = require('../controllers/boatController');
const { authMiddleware } = require('../middleware/auth');

// 所有船只路由都需要认证
router.use(authMiddleware);

// 获取所有船只
router.get('/', boatController.getAllBoats);

// 获取单个船只
router.get('/:id', boatController.getBoatById);

// 创建船只
router.post('/', boatController.createBoat);

// 更新船只
router.put('/:id', boatController.updateBoat);

// 删除船只
router.delete('/:id', boatController.deleteBoat);

module.exports = router;
