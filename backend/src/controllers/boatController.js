const { Boat } = require('../models');

// 获取所有船只
exports.getAllBoats = async (req, res) => {
  try {
    const { status, boat_type } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (boat_type) where.boat_type = boat_type;

    const boats = await Boat.findAll({
      where,
      order: [['boat_type', 'ASC'], ['boat_number', 'ASC']]
    });

    res.json({
      success: true,
      data: boats
    });
  } catch (error) {
    console.error('获取船只列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取船只列表失败'
    });
  }
};

// 获取单个船只
exports.getBoatById = async (req, res) => {
  try {
    const boat = await Boat.findByPk(req.params.id);

    if (!boat) {
      return res.status(404).json({
        success: false,
        message: '船只不存在'
      });
    }

    res.json({
      success: true,
      data: boat
    });
  } catch (error) {
    console.error('获取船只详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取船只详情失败'
    });
  }
};

// 创建船只
exports.createBoat = async (req, res) => {
  try {
    const boat = await Boat.create(req.body);

    res.status(201).json({
      success: true,
      message: '创建船只成功',
      data: boat
    });
  } catch (error) {
    console.error('创建船只失败:', error);
    res.status(500).json({
      success: false,
      message: '创建船只失败',
      error: error.message
    });
  }
};

// 更新船只
exports.updateBoat = async (req, res) => {
  try {
    const boat = await Boat.findByPk(req.params.id);

    if (!boat) {
      return res.status(404).json({
        success: false,
        message: '船只不存在'
      });
    }

    await boat.update(req.body);

    res.json({
      success: true,
      message: '更新成功',
      data: boat
    });
  } catch (error) {
    console.error('更新船只失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
};

// 删除船只
exports.deleteBoat = async (req, res) => {
  try {
    const boat = await Boat.findByPk(req.params.id);

    if (!boat) {
      return res.status(404).json({
        success: false,
        message: '船只不存在'
      });
    }

    await boat.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除船只失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
};
