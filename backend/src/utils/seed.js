require('dotenv').config();
const bcrypt = require('bcryptjs');
const { 
  User, 
  Room, 
  Boat, 
  Course, 
  Staff, 
  Equipment,
  syncDatabase,
  sequelize
} = require('../models');

// 初始数据
const seedData = async () => {
  try {
    console.log('开始初始化数据...');

    // 同步数据库（清空现有数据）
    await syncDatabase(true);

    // 1. 创建管理员账号
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      name: '系统管理员',
      role: 'admin',
      email: 'admin@diveерp.com',
      status: 'active'
    });
    console.log('✓ 管理员账号创建成功');

    // 2. 创建房间
    const rooms = [
      // A楼
      { room_number: 'A2', floor: 'A', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'A3', floor: 'A', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'A5', floor: 'A', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'A6', floor: 'A', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'A7', floor: 'A', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'A8', floor: 'A', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'A9', floor: 'A', max_capacity: 3, room_type: '大床+单人床' },
      // B楼
      { room_number: 'B2', floor: 'B', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'B3', floor: 'B', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'B5', floor: 'B', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'B6', floor: 'B', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'B7', floor: 'B', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'B8', floor: 'B', max_capacity: 3, room_type: '大床+单人床' },
      { room_number: 'B9', floor: 'B', max_capacity: 3, room_type: '大床+单人床' }
    ];
    await Room.bulkCreate(rooms);
    console.log('✓ 房间数据创建成功');

    // 3. 创建船只
    const boats = [
      { boat_number: '1311', boat_name: '1311小船', boat_type: 'small', max_capacity: 10 },
      { boat_number: '10008', boat_name: '10008小船', boat_type: 'small', max_capacity: 10 },
      { boat_number: '11599', boat_name: '11599小船', boat_type: 'small', max_capacity: 10 },
      { boat_number: '11699', boat_name: '11699小船', boat_type: 'small', max_capacity: 10 },
      { boat_number: '11499', boat_name: '11499大船', boat_type: 'large', max_capacity: 20 },
      { boat_number: '1992', boat_name: '1992大船', boat_type: 'large', max_capacity: 20 }
    ];
    await Boat.bulkCreate(boats);
    console.log('✓ 船只数据创建成功');

    // 4. 创建课程
    const courses = [
      {
        course_code: 'OW',
        course_name: 'PADI开放水域潜水员',
        course_name_en: 'PADI Open Water Diver',
        certification_org: 'PADI',
        level: 'Entry Level',
        duration_days: 3,
        price: 1800.00,
        currency: 'MYR',
        description: '入门级潜水课程，学习基础潜水技能',
        status: 'active'
      },
      {
        course_code: 'AOW',
        course_name: 'PADI进阶开放水域潜水员',
        course_name_en: 'PADI Advanced Open Water Diver',
        certification_org: 'PADI',
        level: 'Advanced',
        duration_days: 2,
        price: 1500.00,
        currency: 'MYR',
        description: '进阶潜水课程，提升潜水技能',
        requirements: '需要OW证书',
        status: 'active'
      },
      {
        course_code: 'RES',
        course_name: 'PADI救援潜水员',
        course_name_en: 'PADI Rescue Diver',
        certification_org: 'PADI',
        level: 'Professional',
        duration_days: 3,
        price: 2000.00,
        currency: 'MYR',
        description: '学习救援技能和应急处理',
        requirements: '需要AOW证书和急救证书',
        status: 'active'
      },
      {
        course_code: 'DM',
        course_name: 'PADI潜水长',
        course_name_en: 'PADI Divemaster',
        certification_org: 'PADI',
        level: 'Professional',
        duration_days: 10,
        price: 5000.00,
        currency: 'MYR',
        description: '专业级潜水课程',
        requirements: '需要救援潜水员证书',
        status: 'active'
      },
      {
        course_code: 'FD',
        course_name: '体验潜水',
        course_name_en: 'Discover Scuba Diving',
        certification_org: 'PADI',
        level: 'Experience',
        duration_days: 1,
        price: 500.00,
        currency: 'MYR',
        description: '无需证书，体验潜水乐趣',
        status: 'active'
      }
    ];
    await Course.bulkCreate(courses);
    console.log('✓ 课程数据创建成功');

    // 5. 创建员工
    const staff = [
      // 船长
      { name: '李明', name_en: 'Li Ming', role: 'captain', phone: '+60123456789', status: 'active' },
      { name: '王强', name_en: 'Wang Qiang', role: 'captain', phone: '+60123456790', status: 'active' },
      { name: '张伟', name_en: 'Zhang Wei', role: 'captain', phone: '+60123456791', status: 'active' },
      // DM (潜水长)
      { name: 'John Smith', name_en: 'John Smith', role: 'dm', phone: '+60123456792', 
        languages: ['English', 'Malay'], status: 'active' },
      { name: 'Sarah Lee', name_en: 'Sarah Lee', role: 'dm', phone: '+60123456793',
        languages: ['English', 'Chinese'], status: 'active' },
      { name: '陈红', name_en: 'Chen Hong', role: 'dm', phone: '+60123456794',
        languages: ['Chinese', 'Malay'], status: 'active' },
      // 教练
      { name: 'David Wong', name_en: 'David Wong', role: 'instructor', phone: '+60123456795',
        certifications: ['PADI MSDT'], languages: ['English', 'Chinese'], status: 'active' },
      { name: 'Lisa Chen', name_en: 'Lisa Chen', role: 'instructor', phone: '+60123456796',
        certifications: ['PADI IDC Staff Instructor'], languages: ['English', 'Chinese'], status: 'active' },
      { name: '刘洋', name_en: 'Liu Yang', role: 'instructor', phone: '+60123456797',
        certifications: ['PADI Open Water Scuba Instructor'], languages: ['Chinese'], status: 'active' }
    ];
    await Staff.bulkCreate(staff);
    console.log('✓ 员工数据创建成功');

    // 6. 创建装备示例
    const equipment = [
      // BCD
      { equipment_code: 'BCD001', equipment_type: 'bcd', brand: 'Scubapro', model: 'Hydros Pro', size: 'L', condition: 'excellent' },
      { equipment_code: 'BCD002', equipment_type: 'bcd', brand: 'Scubapro', model: 'Hydros Pro', size: 'M', condition: 'excellent' },
      { equipment_code: 'BCD003', equipment_type: 'bcd', brand: 'Scubapro', model: 'Hydros Pro', size: 'S', condition: 'good' },
      // 调节器
      { equipment_code: 'REG001', equipment_type: 'regulator', brand: 'Scubapro', model: 'MK25 EVO', condition: 'excellent' },
      { equipment_code: 'REG002', equipment_type: 'regulator', brand: 'Scubapro', model: 'MK25 EVO', condition: 'good' },
      { equipment_code: 'REG003', equipment_type: 'regulator', brand: 'Aqualung', model: 'Legend', condition: 'good' },
      // 潜水服
      { equipment_code: 'WS001', equipment_type: 'wetsuit', brand: 'Bare', model: '3mm', size: 'L', condition: 'good' },
      { equipment_code: 'WS002', equipment_type: 'wetsuit', brand: 'Bare', model: '3mm', size: 'M', condition: 'good' },
      { equipment_code: 'WS003', equipment_type: 'wetsuit', brand: 'Bare', model: '3mm', size: 'S', condition: 'fair' },
      // 脚蹼
      { equipment_code: 'FIN001', equipment_type: 'fins', brand: 'Scubapro', model: 'Jet Fins', size: 'L', condition: 'good' },
      { equipment_code: 'FIN002', equipment_type: 'fins', brand: 'Scubapro', model: 'Jet Fins', size: 'M', condition: 'good' },
      { equipment_code: 'FIN003', equipment_type: 'fins', brand: 'Mares', model: 'Avanti', size: 'L', condition: 'excellent' }
    ];
    await Equipment.bulkCreate(equipment);
    console.log('✓ 装备数据创建成功');

    console.log('\n=================================');
    console.log('✓ 所有初始数据创建成功！');
    console.log('=================================');
    console.log('管理员账号信息：');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
};

// 运行种子数据
seedData();
