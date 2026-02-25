const { Student, Course, Room, Staff, EquipmentAssignment, Equipment, Trip, TripParticipant, Boat } = require('../models');
const { extractPassportInfo } = require('../utils/passport');
const { Op } = require('sequelize');

function generateGuestId() {
  return 'G' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// 获取所有学员
exports.getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, course_id, room_id } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (course_id) where.course_id = course_id;
    if (room_id) where.room_id = room_id;

    const offset = (page - 1) * limit;

    const { count, rows } = await Student.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Course, as: 'course' },
        { model: Room, as: 'room' },
        { model: Staff, as: 'instructor' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        students: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取学员列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学员列表失败'
    });
  }
};

// 获取单个学员
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: Course, as: 'course' },
        { model: Room, as: 'room' },
        { model: Staff, as: 'instructor' },
        { 
          model: EquipmentAssignment, 
          as: 'equipmentAssignments',
          include: [{ model: Equipment, as: 'equipment' }]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('获取学员详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学员详情失败'
    });
  }
};

// 创建学员（报名）
exports.createStudent = async (req, res) => {
  try {
    const studentData = req.validatedData || req.body;

    // 检查护照号是否已存在
    const existingStudent = await Student.findOne({
      where: { passport_number: studentData.passport_number }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: '该护照号已经注册过'
      });
    }

    if (!studentData.guest_id) {
      studentData.guest_id = generateGuestId();
    }
    const student = await Student.create(studentData);

    const isEnroll = req.path === '/enroll' || (req.baseUrl && req.baseUrl.includes('enroll'));
    if (isEnroll) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const boat = await Boat.findOne({ where: { status: { [Op.ne]: 'inactive' } } });
        if (boat) {
          let trip = await Trip.findOne({
            where: { trip_date: today, status: { [Op.in]: ['scheduled', 'in_progress'] } },
            order: [['id', 'ASC']]
          });
          if (!trip) {
            trip = await Trip.create({
              trip_date: today,
              boat_id: boat.id,
              destination: 'Mabul Island',
              departure_time: '08:00:00',
              max_participants: 12,
              current_participants: 0,
              status: 'scheduled'
            });
          }
          const exists = await TripParticipant.findOne({ where: { trip_id: trip.id, student_id: student.id } });
          if (!exists) {
            await TripParticipant.create({ trip_id: trip.id, student_id: student.id, status: 'confirmed' });
            await trip.update({ current_participants: (trip.current_participants || 0) + 1 });
          }
        }
      } catch (err) {
        console.error('Auto-create trip for enroll:', err);
      }
    }

    res.status(201).json({
      success: true,
      message: '报名成功',
      data: student
    });
  } catch (error) {
    console.error('创建学员失败:', error);
    res.status(500).json({
      success: false,
      message: '报名失败',
      error: error.message
    });
  }
};

// 更新学员信息
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    await student.update(req.body);

    res.json({
      success: true,
      message: '更新成功',
      data: student
    });
  } catch (error) {
    console.error('更新学员失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
};

// 删除学员
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    await student.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除学员失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
};

// 分配房间
exports.assignRoom = async (req, res) => {
  try {
    const { room_id, check_in_date, check_out_date } = req.body;
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    const room = await Room.findByPk(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: '房间不存在'
      });
    }

    if (room.current_occupancy >= room.max_capacity) {
      return res.status(400).json({
        success: false,
        message: '房间已满'
      });
    }

    // 更新学员的房间信息
    await student.update({ room_id, check_in_date, check_out_date });

    // 更新房间的入住人数
    await room.update({ 
      current_occupancy: room.current_occupancy + 1,
      status: 'occupied'
    });

    res.json({
      success: true,
      message: '分配房间成功',
      data: student
    });
  } catch (error) {
    console.error('分配房间失败:', error);
    res.status(500).json({
      success: false,
      message: '分配房间失败'
    });
  }
};

// 分配教练
exports.assignInstructor = async (req, res) => {
  try {
    const { instructor_id } = req.body;
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    const instructor = await Staff.findOne({
      where: { id: instructor_id, role: 'instructor', status: 'active' }
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: '教练不存在或不可用'
      });
    }

    await student.update({ instructor_id });

    res.json({
      success: true,
      message: '分配教练成功',
      data: student
    });
  } catch (error) {
    console.error('分配教练失败:', error);
    res.status(500).json({
      success: false,
      message: '分配教练失败'
    });
  }
};

// 上传护照并识别
exports.uploadPassport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传护照照片'
      });
    }

    const passportInfo = await extractPassportInfo(req.file.path);

    res.json({
      success: true,
      message: '护照识别成功',
      data: {
        passport_photo_url: `/uploads/${req.file.filename}`,
        ...passportInfo
      }
    });
  } catch (error) {
    console.error('护照识别失败:', error);
    res.status(500).json({
      success: false,
      message: '护照识别失败，请手动填写信息'
    });
  }
};
