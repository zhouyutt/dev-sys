const { Room, Student, sequelize } = require('../models');

// 获取所有房间
exports.getAllRooms = async (req, res) => {
  try {
    const { floor } = req.query;
    const where = {};
    if (floor) where.floor = floor;

    const rooms = await Room.findAll({
      where,
      include: [
        { model: Student, as: 'students', attributes: ['id', 'name_cn', 'name_en'], required: false }
      ],
      order: [['floor', 'ASC'], ['room_number', 'ASC']]
    });

    // 根据实际关联学员数修正 status 和 current_occupancy，保持与大屏一致
    const corrected = rooms.map(room => {
      const data = room.toJSON();
      const actualCount = (data.students || []).length;
      data.current_occupancy = actualCount;
      if (data.status !== 'maintenance') {
        data.status = actualCount > 0 ? 'occupied' : 'available';
      }
      return data;
    });

    res.json({
      success: true,
      data: corrected
    });
  } catch (error) {
    console.error('Get rooms failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rooms',
      error: error.message
    });
  }
};

// 获取单个房间
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [
        { 
          model: Student, 
          as: 'students'
        }
      ]
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: '房间不存在'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('获取房间详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取房间详情失败'
    });
  }
};

// 创建房间
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message: '创建房间成功',
      data: room
    });
  } catch (error) {
    console.error('创建房间失败:', error);
    res.status(500).json({
      success: false,
      message: '创建房间失败',
      error: error.message
    });
  }
};

// 更新房间
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [{ model: Student, as: 'students', attributes: ['id'], required: false }]
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: '房间不存在'
      });
    }

    // 计算实际住客数，强制同步 status 和 current_occupancy，忽略前端传来的这两个字段
    const actualCount = (room.students || []).length;
    const body = { ...req.body };
    body.current_occupancy = actualCount;
    if (body.status !== 'maintenance') {
      body.status = actualCount > 0 ? 'occupied' : 'available';
    }

    await room.update(body);

    const fresh = await Room.findByPk(room.id, {
      include: [{ model: Student, as: 'students', attributes: ['id', 'name_cn', 'name_en'], required: false }]
    });
    const data = fresh.toJSON();
    data.current_occupancy = actualCount;

    res.json({
      success: true,
      message: '更新成功',
      data
    });
  } catch (error) {
    console.error('更新房间失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
};

// 删除房间
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: '房间不存在'
      });
    }

    // 检查房间是否有住客
    if (room.current_occupancy > 0) {
      return res.status(400).json({
        success: false,
        message: '房间有住客，无法删除'
      });
    }

    await room.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除房间失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
};

// 设置房间住客（覆盖式分配）
exports.setRoomStudents = async (req, res) => {
  const { student_ids } = req.body;

  if (!Array.isArray(student_ids)) {
    return res.status(400).json({
      success: false,
      message: 'student_ids must be an array'
    });
  }

  const t = await sequelize.transaction();
  try {
    const room = await Room.findByPk(req.params.id, { transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: '房间不存在'
      });
    }

    // 清空当前房间的住客
    await Student.update(
      { room_id: null },
      { where: { room_id: room.id }, transaction: t }
    );

    // 重新分配新住客
    if (student_ids.length > 0) {
      await Student.update(
        { room_id: room.id },
        { where: { id: student_ids }, transaction: t }
      );
    }

    const newCount = await Student.count({
      where: { room_id: room.id },
      transaction: t
    });

    await room.update(
      {
        current_occupancy: newCount,
        status: newCount > 0 ? 'occupied' : 'available'
      },
      { transaction: t }
    );

    await t.commit();

    const fresh = await Room.findByPk(room.id, {
      include: [
        { model: Student, as: 'students', attributes: ['id', 'name_cn', 'name_en'] }
      ]
    });

    res.json({
      success: true,
      message: '房间住客更新成功',
      data: fresh
    });
  } catch (error) {
    await t.rollback();
    console.error('更新房间住客失败:', error);
    res.status(500).json({
      success: false,
      message: '更新房间住客失败'
    });
  }
};

// 获取房间状态概览
exports.getRoomStatus = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [
        { 
          model: Student, 
          as: 'students',
          attributes: ['id', 'name_en', 'name_cn', 'check_in_date', 'check_out_date']
        }
      ],
      order: [['floor', 'ASC'], ['room_number', 'ASC']]
    });

    const statusSummary = {
      available: 0,
      occupied: 0,
      maintenance: 0,
      reserved: 0
    };

    rooms.forEach(room => {
      const actualCount = (room.students || []).length;
      room.current_occupancy = actualCount;
      if (room.status !== 'maintenance') {
        room.status = actualCount > 0 ? 'occupied' : 'available';
      }
      statusSummary[room.status] = (statusSummary[room.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        rooms,
        summary: statusSummary
      }
    });
  } catch (error) {
    console.error('获取房间状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取房间状态失败'
    });
  }
};
