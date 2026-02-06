const { Trip, Boat, Staff, TripParticipant, Student } = require('../models');
const { Op } = require('sequelize');

// 获取所有行程
exports.getAllTrips = async (req, res) => {
  try {
    const { date, destination, status } = req.query;
    
    const where = {};
    if (date) where.trip_date = date;
    if (destination) where.destination = destination;
    if (status) where.status = status;

    const trips = await Trip.findAll({
      where,
      include: [
        { model: Boat, as: 'boat' },
        { model: Staff, as: 'captain', attributes: ['id', 'name', 'name_en'] },
        { model: Staff, as: 'dm', attributes: ['id', 'name', 'name_en'] },
        { model: Staff, as: 'instructor', attributes: ['id', 'name', 'name_en'] },
        { 
          model: TripParticipant, 
          as: 'participants',
          include: [
            { model: Student, as: 'student', attributes: ['id', 'name_en', 'name_cn', 'phone'] }
          ]
        }
      ],
      order: [['trip_date', 'DESC'], ['departure_time', 'ASC']]
    });

    res.json({
      success: true,
      data: trips
    });
  } catch (error) {
    console.error('获取行程列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取行程列表失败'
    });
  }
};

// 获取明天的行程（大屏展示用）
exports.getTomorrowTrips = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const trips = await Trip.findAll({
      where: { 
        trip_date: tomorrowStr,
        status: { [Op.ne]: 'cancelled' }
      },
      include: [
        { model: Boat, as: 'boat' },
        { model: Staff, as: 'captain', attributes: ['id', 'name', 'name_en'] },
        { model: Staff, as: 'dm', attributes: ['id', 'name', 'name_en'] },
        { model: Staff, as: 'instructor', attributes: ['id', 'name', 'name_en'] },
        { 
          model: TripParticipant, 
          as: 'participants',
          where: { status: 'confirmed' },
          required: false,
          include: [
            { model: Student, as: 'student', attributes: ['id', 'name_en', 'name_cn'] }
          ]
        }
      ],
      order: [['destination', 'ASC'], ['departure_time', 'ASC']]
    });

    // 按目的地分组
    const groupedTrips = {};
    trips.forEach(trip => {
      if (!groupedTrips[trip.destination]) {
        groupedTrips[trip.destination] = [];
      }
      groupedTrips[trip.destination].push(trip);
    });

    res.json({
      success: true,
      data: {
        date: tomorrowStr,
        trips,
        groupedByDestination: groupedTrips
      }
    });
  } catch (error) {
    console.error('获取明天行程失败:', error);
    res.status(500).json({
      success: false,
      message: '获取明天行程失败'
    });
  }
};

// 获取单个行程
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Boat, as: 'boat' },
        { model: Staff, as: 'captain' },
        { model: Staff, as: 'dm' },
        { model: Staff, as: 'instructor' },
        { 
          model: TripParticipant, 
          as: 'participants',
          include: [{ model: Student, as: 'student' }]
        }
      ]
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: '行程不存在'
      });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('获取行程详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取行程详情失败'
    });
  }
};

// 创建行程
exports.createTrip = async (req, res) => {
  try {
    const trip = await Trip.create(req.body);

    res.status(201).json({
      success: true,
      message: '创建行程成功',
      data: trip
    });
  } catch (error) {
    console.error('创建行程失败:', error);
    res.status(500).json({
      success: false,
      message: '创建行程失败',
      error: error.message
    });
  }
};

// 更新行程
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: '行程不存在'
      });
    }

    await trip.update(req.body);

    res.json({
      success: true,
      message: '更新成功',
      data: trip
    });
  } catch (error) {
    console.error('更新行程失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
};

// 删除行程
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: '行程不存在'
      });
    }

    await trip.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除行程失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
};

// 添加参与者到行程
exports.addParticipant = async (req, res) => {
  try {
    const { student_id } = req.body;
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: '行程不存在'
      });
    }

    // 检查是否已经添加
    const existing = await TripParticipant.findOne({
      where: { trip_id: trip.id, student_id }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: '该学员已在行程中'
      });
    }

    // 检查人数是否已满
    if (trip.current_participants >= trip.max_participants) {
      return res.status(400).json({
        success: false,
        message: '行程人数已满'
      });
    }

    const participant = await TripParticipant.create({
      trip_id: trip.id,
      student_id,
      status: 'confirmed'
    });

    // 更新行程当前参与人数
    await trip.update({ 
      current_participants: trip.current_participants + 1 
    });

    res.status(201).json({
      success: true,
      message: '添加参与者成功',
      data: participant
    });
  } catch (error) {
    console.error('添加参与者失败:', error);
    res.status(500).json({
      success: false,
      message: '添加参与者失败'
    });
  }
};

// 从行程中移除参与者
exports.removeParticipant = async (req, res) => {
  try {
    const { student_id } = req.body;
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: '行程不存在'
      });
    }

    const participant = await TripParticipant.findOne({
      where: { trip_id: trip.id, student_id }
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: '参与者不存在'
      });
    }

    await participant.destroy();

    // 更新行程当前参与人数
    await trip.update({ 
      current_participants: Math.max(0, trip.current_participants - 1)
    });

    res.json({
      success: true,
      message: '移除参与者成功'
    });
  } catch (error) {
    console.error('移除参与者失败:', error);
    res.status(500).json({
      success: false,
      message: '移除参与者失败'
    });
  }
};
