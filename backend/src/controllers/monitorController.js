const { User, Student, Trip, Room, Staff, Boat, sequelize } = require('../models');
const { Op } = require('sequelize');
const os = require('os');

// 获取系统概览
exports.getSystemOverview = async (req, res) => {
  try {
    // 统计数据
    const [
      totalUsers,
      activeUsers,
      totalStudents,
      activeStudents,
      totalTrips,
      todayTrips,
      totalRooms,
      occupiedRooms,
      totalStaff,
      activeStaff,
      totalBoats,
      activeBoats
    ] = await Promise.all([
      User.count(),
      User.count({ where: { status: 'active' } }),
      Student.count(),
      Student.count({ where: { status: 'active' } }),
      Trip.count(),
      Trip.count({ where: { trip_date: new Date().toISOString().split('T')[0] } }),
      Room.count(),
      Room.count({ where: { status: 'occupied' } }),
      Staff.count(),
      Staff.count({ where: { status: 'active' } }),
      Boat.count(),
      Boat.count({ where: { status: 'active' } })
    ]);

    // 系统信息
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: Math.floor(os.uptime() / 3600), // hours
      totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024), // GB
      freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024), // GB
      cpuCount: os.cpus().length,
      nodeVersion: process.version
    };

    res.json({
      success: true,
      data: {
        statistics: {
          users: { total: totalUsers, active: activeUsers },
          students: { total: totalStudents, active: activeStudents },
          trips: { total: totalTrips, today: todayTrips },
          rooms: { total: totalRooms, occupied: occupiedRooms },
          staff: { total: totalStaff, active: activeStaff },
          boats: { total: totalBoats, active: activeBoats }
        },
        system: systemInfo
      }
    });
  } catch (error) {
    console.error('Get system overview failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system overview',
      error: error.message
    });
  }
};

// 获取在线用户（最近30分钟内有活动的用户）
exports.getOnlineUsers = async (req, res) => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // 这里简化处理，实际应该从session或token记录中获取
    // 暂时返回所有活跃用户
    const onlineUsers = await User.findAll({
      where: {
        status: 'active',
        updated_at: {
          [Op.gte]: thirtyMinutesAgo
        }
      },
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }],
      order: [['updated_at', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: onlineUsers,
      total: onlineUsers.length
    });
  } catch (error) {
    console.error('Get online users failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get online users',
      error: error.message
    });
  }
};

// 获取登录日志
exports.getLoginLogs = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, startDate, endDate, username } = req.query;
    const offset = (page - 1) * pageSize;

    // 这里应该从实际的登录日志表中查询
    // 暂时返回空数据，需要创建LoginLog模型
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: 0
      },
      message: 'Login log feature coming soon'
    });
  } catch (error) {
    console.error('Get login logs failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get login logs',
      error: error.message
    });
  }
};

// 获取操作日志
exports.getOperationLogs = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, startDate, endDate, username, action } = req.query;
    const offset = (page - 1) * pageSize;

    // 这里应该从实际的操作日志表中查询
    // 暂时返回空数据，需要创建OperationLog模型
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: 0
      },
      message: 'Operation log feature coming soon'
    });
  } catch (error) {
    console.error('Get operation logs failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get operation logs',
      error: error.message
    });
  }
};

// 获取系统日志
exports.getSystemLogs = async (req, res) => {
  try {
    const { page = 1, pageSize = 50, level, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;

    // 这里应该从实际的系统日志表中查询
    // 暂时返回空数据，需要创建SystemLog模型
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: 0
      },
      message: 'System log feature coming soon'
    });
  } catch (error) {
    console.error('Get system logs failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system logs',
      error: error.message
    });
  }
};
