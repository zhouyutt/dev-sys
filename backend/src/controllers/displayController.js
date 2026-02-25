const { Trip, Boat, Staff, Student, Room, TripParticipant, sequelize } = require('../models');
const { Op } = require('sequelize');

// 首页看板统计（当天出海人数、入住人数、学员数量、房间剩余、待处理报名等）
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [rooms, todayTrips, studentCountResult, pendingStudents] = await Promise.all([
      Room.findAll({ attributes: ['id', 'status', 'current_occupancy', 'max_capacity'] }),
      Trip.findAll({
        where: { trip_date: today, status: { [Op.in]: ['scheduled', 'in_progress'] } },
        include: [{ model: TripParticipant, as: 'participants', attributes: ['id'] }]
      }),
      Student.count(),
      Student.count({ where: { status: 'pending' } })
    ]);

    let todayTripParticipants = 0;
    todayTrips.forEach(t => { todayTripParticipants += (t.participants && t.participants.length) || 0; });

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const inHouseCount = rooms.reduce((sum, r) => sum + (Number(r.current_occupancy) || 0), 0);
    const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    res.json({
      success: true,
      data: {
        todayTripParticipants,
        inHouseCount,
        studentCount: studentCountResult,
        roomsAvailable: availableRooms,
        roomsTotal: totalRooms,
        roomsOccupied: occupiedRooms,
        roomOccupancyPercent: occupancyPercent,
        pendingEnrollmentsCount: pendingStudents
      }
    });
  } catch (error) {
    console.error('getDashboardStats failed:', error);
    res.status(500).json({ success: false, message: '获取看板统计失败', error: error.message });
  }
};

// 近几日每日学员数量、每日出海人数（首页图表）
exports.getDailyStats = async (req, res) => {
  try {
    const days = 7;
    const today = new Date().toISOString().split('T')[0];
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const dailyStudentCounts = await Promise.all(
      dates.map(date =>
        Student.count({
          where: {
            enrollment_date: {
              [Op.between]: [date + ' 00:00:00', date + ' 23:59:59']
            }
          }
        }).then(count => ({ date, count }))
      )
    ).catch(() => dates.map(date => ({ date, count: 0 })));

    const dailyTripParticipants = await Promise.all(
      dates.map(async (date) => {
        const trips = await Trip.findAll({
          where: { trip_date: date },
          include: [{ model: TripParticipant, as: 'participants', attributes: ['id'] }]
        });
        const count = trips.reduce((sum, t) => sum + (t.participants?.length || 0), 0);
        return { date, count };
      })
    );

    res.json({
      success: true,
      data: {
        dailyStudents: dailyStudentCounts,
        dailyTripParticipants
      }
    });
  } catch (error) {
    console.error('getDailyStats failed:', error);
    res.status(500).json({ success: false, message: '获取每日统计失败', error: error.message });
  }
};

// 获取今日按岛屿分组的行程（大屏展示）
// 支持 query.date=YYYY-MM-DD，与前端显示的日期一致；不传则用服务器当天
exports.getTodayTripsByIsland = async (req, res) => {
  try {
    const requestedDate = req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : new Date().toISOString().split('T')[0];
    let queryDate = requestedDate;

    // 先查请求日期的行程
    let trips = await Trip.findAll({
      where: {
        trip_date: queryDate,
        status: {
          [Op.in]: ['scheduled', 'in_progress']
        }
      },
      include: [
        {
          model: Boat,
          as: 'boat',
          attributes: ['id', 'boat_number', 'boat_name', 'boat_type', 'max_capacity']
        },
        {
          model: Staff,
          as: 'captain',
          attributes: ['id', 'name', 'name_en', 'role']
        },
        {
          model: Staff,
          as: 'dm',
          attributes: ['id', 'name', 'name_en', 'role']
        },
        {
          model: Staff,
          as: 'instructor',
          attributes: ['id', 'name', 'name_en', 'role']
        }
      ],
      order: [['departure_time', 'ASC']]
    });

    // 若请求日期没有行程，则用「最近有行程的日期」以便大屏至少能展示数据
    if (trips.length === 0) {
      const latestRow = await Trip.findOne({
        where: { status: { [Op.in]: ['scheduled', 'in_progress'] } },
        attributes: ['trip_date'],
        order: [['trip_date', 'DESC']]
      });
      if (latestRow && latestRow.trip_date) {
        queryDate = latestRow.trip_date;
        trips = await Trip.findAll({
          where: {
            trip_date: queryDate,
            status: { [Op.in]: ['scheduled', 'in_progress'] }
          },
          include: [
            { model: Boat, as: 'boat', attributes: ['id', 'boat_number', 'boat_name', 'boat_type', 'max_capacity'] },
            { model: Staff, as: 'captain', attributes: ['id', 'name', 'name_en', 'role'] },
            { model: Staff, as: 'dm', attributes: ['id', 'name', 'name_en', 'role'] },
            { model: Staff, as: 'instructor', attributes: ['id', 'name', 'name_en', 'role'] }
          ],
          order: [['departure_time', 'ASC']]
        });
      }
    }

    // 获取每个行程的参与学生
    const tripsWithParticipants = await Promise.all(
      trips.map(async (trip) => {
        const participants = await TripParticipant.findAll({
          where: { trip_id: trip.id },
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'name_cn', 'name_en', 'certification_level', 'learning_content']
            }
          ]
        });

        // 确保students始终是数组
        const studentsList = participants
          .map(p => p.student)
          .filter(s => s !== null && s !== undefined);
        
        return {
          ...trip.toJSON(),
          students: Array.isArray(studentsList) ? studentsList : []
        };
      })
    );

    // 按岛屿分组
    const islands = {
      'Mabul Island': [],
      'Mataking Island': [],
      'Sipadan': [],
      'Si Amil Island': []
    };

    tripsWithParticipants.forEach(trip => {
      if (islands[trip.destination]) {
        islands[trip.destination].push(trip);
      }
    });

    res.set('Cache-Control', 'no-store');
    res.json({
      success: true,
      date: queryDate,
      islands
    });
  } catch (error) {
    console.error('获取今日行程失败:', error);
    res.status(500).json({ message: '获取今日行程失败', error: error.message });
  }
};

// 获取实时房间状态（大屏展示）
exports.getRoomsStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 获取所有房间及其当前入住学生
    const rooms = await Room.findAll({
      attributes: ['id', 'room_number', 'floor', 'room_type', 'max_capacity', 'current_occupancy', 'status'],
      order: [['room_number', 'ASC']]
    });

    // 获取今天入住的学生
    const studentsInRooms = await Student.findAll({
      where: {
        room_id: {
          [Op.ne]: null
        },
        check_in_date: {
          [Op.lte]: today
        },
        check_out_date: {
          [Op.gte]: today
        }
      },
      attributes: ['id', 'name_cn', 'name_en', 'room_id', 'check_in_date', 'check_out_date']
    });

    // 按楼层分组
    const roomsByFloor = {
      'A': [],
      'B': []
    };

    rooms.forEach(room => {
      const roomData = room.toJSON();
      const assigned = studentsInRooms.filter(s => s.room_id === room.id);
      roomData.students = assigned;
      roomData.current_occupancy = assigned.length;
      if (assigned.length > 0 && room.status === 'available') {
        roomData.status = 'occupied';
      }
      if (roomsByFloor[room.floor]) {
        roomsByFloor[room.floor].push(roomData);
      }
    });

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => {
      const assigned = studentsInRooms.filter(s => s.room_id === r.id);
      return assigned.length > 0 || r.status === 'occupied';
    }).length;
    const availableRooms = totalRooms - occupiedRooms;

    res.set('Cache-Control', 'no-store');
    res.json({
      success: true,
      statistics: {
        total: totalRooms,
        occupied: occupiedRooms,
        available: availableRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0
      },
      roomsByFloor
    });
  } catch (error) {
    console.error('获取房间状态失败:', error);
    res.status(500).json({ message: '获取房间状态失败', error: error.message });
  }
};
