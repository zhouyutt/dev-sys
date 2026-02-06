const { Trip, Boat, Staff, Student, Room, TripParticipant, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取今日按岛屿分组的行程（大屏展示）
exports.getTodayTripsByIsland = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 获取今天的所有行程
    const trips = await Trip.findAll({
      where: {
        trip_date: today,
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

    // 获取每个行程的参与学生
    const tripsWithParticipants = await Promise.all(
      trips.map(async (trip) => {
        const participants = await TripParticipant.findAll({
          where: { trip_id: trip.id },
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'name_cn', 'name_en', 'certification_level']
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

    res.json({
      success: true,
      date: today,
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
      roomData.students = studentsInRooms.filter(s => s.room_id === room.id);
      roomData.current_occupancy = roomData.students.length;
      
      if (roomsByFloor[room.floor]) {
        roomsByFloor[room.floor].push(roomData);
      }
    });

    // 统计信息
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = totalRooms - occupiedRooms;

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
