const { Student, Course, Room, Staff, EquipmentAssignment, Equipment, Trip, TripParticipant, Boat, sequelize } = require('../models');
const { extractPassportInfo } = require('../utils/passport');
const { Op } = require('sequelize');
const ENROLL_META_PREFIX = 'ENROLL_META:';

async function generateGuestId() {
  const count = await Student.count();
  const num = (count + 1).toString().padStart(5, '0');
  return 'G' + num;
}

function parseEnrollMetaFromText(specialRequirements) {
  if (!specialRequirements) return {};
  const lines = String(specialRequirements).split('\n');
  const metaLine = lines.find(line => line.startsWith(ENROLL_META_PREFIX));
  if (!metaLine) return {};
  try {
    return JSON.parse(metaLine.slice(ENROLL_META_PREFIX.length));
  } catch (e) {
    return {};
  }
}

function mergeSpecialRequirements(originalText, meta) {
  const lines = (originalText || '')
    .split('\n')
    .filter(line => line && !line.startsWith(ENROLL_META_PREFIX));
  lines.push(`${ENROLL_META_PREFIX}${JSON.stringify(meta)}`);
  return lines.join('\n');
}

function normalizeLearningContent(input) {
  if (Array.isArray(input)) return input.filter(Boolean);
  if (!input) return [];
  return String(input)
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
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
    const isEnroll = req.path === '/enroll' || (req.baseUrl && req.baseUrl.includes('enroll'));
    const {
      agree_protocol,
      room_sharing_preference,
      sipadan_trip,
      stay_required,
      fun_dive_dates,
      check_in_date,
      check_out_date,
      learning_content,
      ...persistData
    } = studentData;

    // 检查护照号是否已存在
    const existingStudent = await Student.findOne({
      where: { passport_number: persistData.passport_number }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: '该护照号已经注册过'
      });
    }

    if (!persistData.guest_id) {
      persistData.guest_id = await generateGuestId();
    }

    const learningContents = normalizeLearningContent(learning_content);
    persistData.learning_content = learningContents[0] || null;
    persistData.check_in_date = check_in_date || null;
    persistData.check_out_date = check_out_date || null;

    // 空字符串转 null，避免触发 isEmail 等验证器
    if (persistData.email === '') persistData.email = null;
    if (persistData.wechat === '') persistData.wechat = null;

    const enrollMeta = {
      learning_contents: learningContents,
      stay_required: stay_required === true,
      room_sharing_preference: room_sharing_preference || null,
      sipadan_trip: sipadan_trip === true,
      fun_dive_dates: Array.isArray(fun_dive_dates) ? fun_dive_dates.filter(Boolean) : [],
      agree_protocol: agree_protocol === true,
      agree_protocol_at: agree_protocol === true ? new Date().toISOString() : null
    };
    persistData.special_requirements = mergeSpecialRequirements(persistData.special_requirements, enrollMeta);

    const student = await Student.create(persistData);
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

    const payload = { ...req.body };
    const hasLearningContentField = Object.prototype.hasOwnProperty.call(payload, 'learning_content');
    const learningContents = normalizeLearningContent(payload.learning_content);
    if (hasLearningContentField) {
      payload.learning_content = learningContents[0] || null;
    }

    const oldMeta = parseEnrollMetaFromText(student.special_requirements);
    const mergedMeta = {
      ...oldMeta,
      learning_contents: hasLearningContentField ? learningContents : (oldMeta.learning_contents || []),
      stay_required:
        payload.stay_required === undefined ? oldMeta.stay_required === true : payload.stay_required === true,
      room_sharing_preference:
        payload.room_sharing_preference === undefined
          ? oldMeta.room_sharing_preference || null
          : payload.room_sharing_preference || null,
      sipadan_trip: payload.sipadan_trip === undefined ? oldMeta.sipadan_trip === true : payload.sipadan_trip === true,
      fun_dive_dates:
        payload.fun_dive_dates === undefined
          ? oldMeta.fun_dive_dates || []
          : (Array.isArray(payload.fun_dive_dates) ? payload.fun_dive_dates.filter(Boolean) : []),
      agree_protocol: payload.agree_protocol === undefined ? oldMeta.agree_protocol === true : payload.agree_protocol === true,
      agree_protocol_at:
        payload.agree_protocol === true
          ? new Date().toISOString()
          : (oldMeta.agree_protocol_at || null)
    };

    payload.special_requirements = mergeSpecialRequirements(payload.special_requirements ?? student.special_requirements, mergedMeta);
    delete payload.stay_required;
    delete payload.room_sharing_preference;
    delete payload.sipadan_trip;
    delete payload.fun_dive_dates;
    delete payload.agree_protocol;

    await student.update(payload);

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
  const t = await sequelize.transaction();
  try {
    const student = await Student.findByPk(req.params.id, { transaction: t });

    if (!student) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    // 1. 找出该学员参与的所有行程，更新行程的 current_participants 计数
    const participations = await TripParticipant.findAll({
      where: { student_id: student.id, status: 'confirmed' },
      transaction: t
    });
    for (const p of participations) {
      await Trip.update(
        { current_participants: sequelize.literal('GREATEST(current_participants - 1, 0)') },
        { where: { id: p.trip_id }, transaction: t }
      );
    }

    // 2. 删除所有行程参与记录
    await TripParticipant.destroy({
      where: { student_id: student.id },
      transaction: t
    });

    // 3. 删除装备分配记录
    await EquipmentAssignment.destroy({
      where: { student_id: student.id },
      transaction: t
    });

    // 4. 如果学员有房间，减少房间入住计数
    if (student.room_id) {
      await Room.update(
        { current_occupancy: sequelize.literal('GREATEST(current_occupancy - 1, 0)') },
        { where: { id: student.room_id }, transaction: t }
      );
    }

    // 5. 删除学员
    await student.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    await t.rollback();
    console.error('删除学员失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
};

// 分配房间
exports.assignRoom = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { room_id, check_in_date, check_out_date } = req.body;
    const student = await Student.findByPk(req.params.id, { transaction: t });

    if (!student) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    const room = await Room.findByPk(room_id, { lock: true, transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: '房间不存在'
      });
    }

    if (room.current_occupancy >= room.max_capacity) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: '房间已满'
      });
    }

    // 如果学员已有房间，先减少旧房间的入住计数
    if (student.room_id && student.room_id !== room_id) {
      const oldRoom = await Room.findByPk(student.room_id, { lock: true, transaction: t });
      if (oldRoom) {
        await oldRoom.update({
          current_occupancy: Math.max(0, oldRoom.current_occupancy - 1),
          status: oldRoom.current_occupancy - 1 <= 0 ? 'available' : oldRoom.status
        }, { transaction: t });
      }
    }

    // 更新学员的房间信息
    await student.update({ room_id, check_in_date, check_out_date }, { transaction: t });

    // 更新新房间的入住人数（仅当换了新房间时才增加）
    if (student.room_id !== room_id) {
      await room.update({
        current_occupancy: room.current_occupancy + 1,
        status: 'occupied'
      }, { transaction: t });
    }

    await t.commit();

    res.json({
      success: true,
      message: '分配房间成功',
      data: student
    });
  } catch (error) {
    await t.rollback();
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
