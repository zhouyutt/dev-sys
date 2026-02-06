const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// 导入所有模型
const User = require('./User')(sequelize, DataTypes);
const Role = require('./Role')(sequelize, DataTypes);
const Permission = require('./Permission')(sequelize, DataTypes);
const Menu = require('./Menu')(sequelize, DataTypes);
const UserRole = require('./UserRole')(sequelize, DataTypes);
const RolePermission = require('./RolePermission')(sequelize, DataTypes);
const Student = require('./Student')(sequelize, DataTypes);
const Room = require('./Room')(sequelize, DataTypes);
const Boat = require('./Boat')(sequelize, DataTypes);
const Course = require('./Course')(sequelize, DataTypes);
const Staff = require('./Staff')(sequelize, DataTypes);
const Trip = require('./Trip')(sequelize, DataTypes);
const TripParticipant = require('./TripParticipant')(sequelize, DataTypes);
const Equipment = require('./Equipment')(sequelize, DataTypes);
const EquipmentAssignment = require('./EquipmentAssignment')(sequelize, DataTypes);

// 定义模型关联关系
const setupAssociations = () => {
  // 用户与角色的多对多关系
  User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', as: 'roles' });
  Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', as: 'users' });

  // 角色与权限的多对多关系
  Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', as: 'permissions' });
  Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', as: 'roles' });

  // Menu的父子关系
  Menu.hasMany(Menu, { foreignKey: 'parent_id', as: 'children' });
  Menu.belongsTo(Menu, { foreignKey: 'parent_id', as: 'parent' });

  // 学员与课程的关系
  Student.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
  Course.hasMany(Student, { foreignKey: 'course_id', as: 'students' });

  // 学员与房间的关系
  Student.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
  Room.hasMany(Student, { foreignKey: 'room_id', as: 'students' });

  // 学员与教练的关系
  Student.belongsTo(Staff, { foreignKey: 'instructor_id', as: 'instructor' });
  Staff.hasMany(Student, { foreignKey: 'instructor_id', as: 'students' });

  // 行程与船只的关系
  Trip.belongsTo(Boat, { foreignKey: 'boat_id', as: 'boat' });
  Boat.hasMany(Trip, { foreignKey: 'boat_id', as: 'trips' });

  // 行程与船长的关系
  Trip.belongsTo(Staff, { foreignKey: 'captain_id', as: 'captain' });
  
  // 行程与DM的关系
  Trip.belongsTo(Staff, { foreignKey: 'dm_id', as: 'dm' });
  
  // 行程与教练的关系
  Trip.belongsTo(Staff, { foreignKey: 'instructor_id', as: 'instructor' });

  // 行程参与者关联（学员参加行程）
  TripParticipant.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip' });
  TripParticipant.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Trip.hasMany(TripParticipant, { foreignKey: 'trip_id', as: 'participants' });
  Student.hasMany(TripParticipant, { foreignKey: 'student_id', as: 'tripParticipations' });

  // 装备分配关联
  EquipmentAssignment.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
  EquipmentAssignment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Equipment.hasMany(EquipmentAssignment, { foreignKey: 'equipment_id', as: 'assignments' });
  Student.hasMany(EquipmentAssignment, { foreignKey: 'student_id', as: 'equipmentAssignments' });
};

setupAssociations();

// 同步数据库
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force && process.env.NODE_ENV === 'development' });
    console.log('✓ Database sync successful');
  } catch (error) {
    console.error('✗ Database sync failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  Menu,
  UserRole,
  RolePermission,
  Student,
  Room,
  Boat,
  Course,
  Staff,
  Trip,
  TripParticipant,
  Equipment,
  EquipmentAssignment,
  syncDatabase
};
