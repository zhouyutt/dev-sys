const { Equipment, EquipmentAssignment, Student } = require('../models');

// 获取所有装备
exports.getAllEquipment = async (req, res) => {
  try {
    const { status, equipment_type, condition } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (equipment_type) where.equipment_type = equipment_type;
    if (condition) where.condition = condition;

    const equipment = await Equipment.findAll({
      where,
      order: [['equipment_type', 'ASC'], ['equipment_code', 'ASC']]
    });

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('获取装备列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取装备列表失败'
    });
  }
};

// 获取单个装备
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id, {
      include: [
        { 
          model: EquipmentAssignment, 
          as: 'assignments',
          include: [{ model: Student, as: 'student' }],
          order: [['assigned_date', 'DESC']]
        }
      ]
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: '装备不存在'
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('获取装备详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取装备详情失败'
    });
  }
};

// 创建装备
exports.createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);

    res.status(201).json({
      success: true,
      message: '创建装备成功',
      data: equipment
    });
  } catch (error) {
    console.error('创建装备失败:', error);
    res.status(500).json({
      success: false,
      message: '创建装备失败',
      error: error.message
    });
  }
};

// 更新装备
exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: '装备不存在'
      });
    }

    await equipment.update(req.body);

    res.json({
      success: true,
      message: '更新成功',
      data: equipment
    });
  } catch (error) {
    console.error('更新装备失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
};

// 删除装备
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: '装备不存在'
      });
    }

    await equipment.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除装备失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
};

// 分配装备给学员
exports.assignEquipment = async (req, res) => {
  try {
    const { student_id } = req.body;
    const equipment = await Equipment.findByPk(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: '装备不存在'
      });
    }

    if (equipment.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: '装备不可用'
      });
    }

    const assignment = await EquipmentAssignment.create({
      equipment_id: equipment.id,
      student_id,
      status: 'assigned'
    });

    await equipment.update({ status: 'in_use' });

    res.status(201).json({
      success: true,
      message: '分配装备成功',
      data: assignment
    });
  } catch (error) {
    console.error('分配装备失败:', error);
    res.status(500).json({
      success: false,
      message: '分配装备失败'
    });
  }
};

// 归还装备
exports.returnEquipment = async (req, res) => {
  try {
    const { assignment_id } = req.body;
    
    const assignment = await EquipmentAssignment.findByPk(assignment_id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: '分配记录不存在'
      });
    }

    await assignment.update({
      status: 'returned',
      returned_date: new Date()
    });

    const equipment = await Equipment.findByPk(assignment.equipment_id);
    await equipment.update({ status: 'available' });

    res.json({
      success: true,
      message: '归还装备成功'
    });
  } catch (error) {
    console.error('归还装备失败:', error);
    res.status(500).json({
      success: false,
      message: '归还装备失败'
    });
  }
};
