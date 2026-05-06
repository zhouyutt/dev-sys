const { PriceItem } = require('../models');
const defaultPriceItems = require('../config/defaultPriceItems');

async function ensureDefaultPriceItems() {
  const count = await PriceItem.count();
  if (count > 0) return;
  for (const item of defaultPriceItems) {
    await PriceItem.create(item);
  }
}

exports.getAllPriceItems = async (req, res) => {
  try {
    await ensureDefaultPriceItems();
    const { category, activeOnly } = req.query;
    const where = {};
    if (category) where.category = category;
    if (activeOnly === 'true') where.is_active = true;

    const items = await PriceItem.findAll({
      where,
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    });

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('获取价格项失败:', error);
    res.status(500).json({ success: false, message: '获取价格项失败' });
  }
};

exports.updatePriceItem = async (req, res) => {
  try {
    const item = await PriceItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: '价格项不存在' });
    }
    await item.update(req.body);
    res.json({ success: true, message: '更新成功', data: item });
  } catch (error) {
    console.error('更新价格项失败:', error);
    res.status(500).json({ success: false, message: '更新价格项失败' });
  }
};

exports.createPriceItem = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.code || !payload.name_en) {
      return res.status(400).json({ success: false, message: 'code 和 name_en 必填' });
    }
    const created = await PriceItem.create(payload);
    res.status(201).json({ success: true, message: '创建成功', data: created });
  } catch (error) {
    console.error('创建价格项失败:', error);
    res.status(500).json({ success: false, message: '创建价格项失败', error: error.message });
  }
};
