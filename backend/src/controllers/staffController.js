const { Staff, Student } = require('../models');

// 获取所有员工
exports.getAllStaff = async (req, res) => {
  try {
    const { role, status } = req.query;
    
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const staff = await Staff.findAll({
      where,
      order: [['role', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('获取员工列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取员工列表失败'
    });
  }
};

// 获取单个员工
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id, {
      include: [
        { 
          model: Student, 
          as: 'students',
          attributes: ['id', 'name_en', 'name_cn', 'status']
        }
      ]
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('获取员工详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取员工详情失败'
    });
  }
};

// 创建员工
exports.createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);

    res.status(201).json({
      success: true,
      message: '创建员工成功',
      data: staff
    });
  } catch (error) {
    console.error('创建员工失败:', error);
    res.status(500).json({
      success: false,
      message: '创建员工失败',
      error: error.message
    });
  }
};

// 更新员工
exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    await staff.update(req.body);

    res.json({
      success: true,
      message: '更新成功',
      data: staff
    });
  } catch (error) {
    console.error('更新员工失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
};

// 删除员工
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    await staff.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除员工失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
};

// 获取可用教练列表
exports.getAvailableInstructors = async (req, res) => {
  try {
    const instructors = await Staff.findAll({
      where: { 
        role: 'instructor', 
        status: 'active' 
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: instructors
    });
  } catch (error) {
    console.error('获取教练列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取教练列表失败'
    });
  }
};
