const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authMiddleware } = require('../middleware/auth');

// 所有装备路由都需要认证
router.use(authMiddleware);

// 获取所有装备
router.get('/', equipmentController.getAllEquipment);

// 获取单个装备
router.get('/:id', equipmentController.getEquipmentById);

// 创建装备
router.post('/', equipmentController.createEquipment);

// 更新装备
router.put('/:id', equipmentController.updateEquipment);

// 删除装备
router.delete('/:id', equipmentController.deleteEquipment);

// 分配装备给学员
router.post('/:id/assign', equipmentController.assignEquipment);

// 归还装备
router.post('/return', equipmentController.returnEquipment);

module.exports = router;
