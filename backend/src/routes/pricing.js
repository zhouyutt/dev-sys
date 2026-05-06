const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', pricingController.getAllPriceItems);
router.post('/', pricingController.createPriceItem);
router.put('/:id', pricingController.updatePriceItem);

module.exports = router;
