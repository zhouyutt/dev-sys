require('dotenv').config();
const bcrypt = require('bcryptjs');
const { 
  User, 
  Room, 
  Boat, 
  Course, 
  Staff, 
  Student,
  Trip,
  TripParticipant,
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
    const boatsData = [
      { boat_number: '1311', boat_name: '1311小船', boat_type: 'small', max_capacity: 10 },
      { boat_number: '10008', boat_name: '10008小船', boat_type: 'small', max_capacity: 10 },
      { boat_number: '11599', boat_name: '11599小船', boat_type: 'small', max_capacity: 10 },
      { boat_number: '11699', boat_name: '11699小船', boat_type: 'small', max_capacity: 10 },
      { boat_number: '11499', boat_name: '11499大船', boat_type: 'large', max_capacity: 20 },
      { boat_number: '1992', boat_name: '1992大船', boat_type: 'large', max_capacity: 20 }
    ];
    await Boat.bulkCreate(boatsData);
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

    // 5b. 创建学员（大屏/行程模拟用）
    const today = new Date().toISOString().split('T')[0];
    const learningContents = ['Fun Dive', 'DSD', 'OW', 'AOW', 'OW+AOW'];
    const studentNames = [
      { name_en: 'Zhang Wei', name_cn: '张伟' },
      { name_en: 'Li Na', name_cn: '李娜' },
      { name_en: 'Wang Fang', name_cn: '王芳' },
      { name_en: 'Liu Yang', name_cn: '刘洋' },
      { name_en: 'Chen Jing', name_cn: '陈静' },
      { name_en: 'Yang Fan', name_cn: '杨帆' },
      { name_en: 'Zhao Min', name_cn: '赵敏' },
      { name_en: 'Sun Yue', name_cn: '孙悦' },
      { name_en: 'Zhou Jie', name_cn: '周杰' },
      { name_en: 'Wu Lei', name_cn: '吴磊' },
      { name_en: 'Zheng Shuang', name_cn: '郑爽' },
      { name_en: 'Feng Bo', name_cn: '冯波' },
      { name_en: 'He Chen', name_cn: '何晨' },
      { name_en: 'Song Jia', name_cn: '宋佳' },
      { name_en: 'Han Mei', name_cn: '韩梅' },
      { name_en: 'Deng Chao', name_cn: '邓超' },
      { name_en: 'Tang Shi', name_cn: '唐石' },
      { name_en: 'Bai Xue', name_cn: '白雪' },
      { name_en: 'Jiang Wen', name_cn: '江文' },
      { name_en: 'Yuan Li', name_cn: '袁丽' }
    ];
    const students = await Student.bulkCreate(
      studentNames.map((n, i) => ({
        name_en: n.name_en,
        name_cn: n.name_cn,
        gender: i % 2 === 0 ? 'male' : 'female',
        phone: `+6012345${String(1000 + i).slice(-4)}`,
        passport_number: `E${String(80000000 + i)}`,
        learning_content: learningContents[i % learningContents.length],
        status: 'active',
        enrollment_date: today
      }))
    );
    console.log('✓ 学员数据创建成功');

    // 5b-1. 为部分学员分配房间，便于房间看板展示占用情况
    const allRooms = await Room.findAll({ order: [['id', 'ASC']] });
    const roomOccupancy = {};
    if (allRooms.length > 0) {
      // 简单分配：前若干名学员按顺序分配到各个房间，每房最多 2 人
      const assignCount = Math.min(students.length, allRooms.length * 2);
      for (let i = 0; i < assignCount; i++) {
        const student = students[i];
        const room = allRooms[i % allRooms.length];
        await Student.update(
          {
            room_id: room.id,
            check_in_date: today,
            check_out_date: today
          },
          { where: { id: student.id } }
        );
        roomOccupancy[room.id] = (roomOccupancy[room.id] || 0) + 1;
      }

      // 根据分配结果更新房间当前入住人数与状态
      for (const room of allRooms) {
        const occ = roomOccupancy[room.id] || 0;
        await room.update({
          current_occupancy: occ,
          status: occ > 0 ? 'occupied' : 'available'
        });
      }
    }
    console.log('✓ 房间占用示例数据创建成功');

    // 5c. 创建行程（今天 + 明天），避免时区/日期不一致时大屏无数据
    const boats = await Boat.findAll({ order: [['id']] });
    const captains = await Staff.findAll({ where: { role: 'captain' }, order: [['id']] });
    const dms = await Staff.findAll({ where: { role: 'dm' }, order: [['id']] });
    const instructors = await Staff.findAll({ where: { role: 'instructor' }, order: [['id']] });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const tripDates = [today, tomorrowStr];
    const destinations = [
      { key: 'Mabul Island', boatIds: [5, 4], times: ['07:00:00', '09:00:00'], cap: 0, dm: [1, 2], inst: [0, 0] },
      { key: 'Mataking Island', boatIds: [5, 1], times: ['07:00:00', '09:00:00'], cap: 0, dm: [0, 0], inst: [1, 1] },
      { key: 'Sipadan', boatIds: [4], times: ['07:00:00'], cap: 0, dm: [2], inst: [2] },
      { key: 'Si Amil Island', boatIds: [6, 4], times: ['07:00:00', '09:00:00'], cap: [1, 0], dm: [1, 1], inst: [2, 1] }
    ];
    let studentIdx = 0;
    for (const tripDate of tripDates) {
      for (const dest of destinations) {
        const boatIdList = dest.boatIds || [boats[0].id];
        const times = dest.times || ['07:00:00'];
        for (let i = 0; i < boatIdList.length; i++) {
          const boat = boats.find(b => b.id === boatIdList[i]) || boats[0];
          const captain = captains[dest.cap !== undefined ? (Array.isArray(dest.cap) ? dest.cap[i] : dest.cap) : 0] || captains[0];
          const dm = dms[Array.isArray(dest.dm) ? dest.dm[i] : dest.dm] || dms[0];
          const instructor = instructors[Array.isArray(dest.inst) ? dest.inst[i] : dest.inst] || instructors[0];
          const trip = await Trip.create({
            trip_date: tripDate,
            destination: dest.key,
            boat_id: boat.id,
            captain_id: captain.id,
            dm_id: dm.id,
            instructor_id: instructor.id,
            departure_time: times[i] || '07:00:00',
            return_time: '15:00:00',
            max_participants: boat.max_capacity,
            current_participants: 0,
            status: 'scheduled'
          });
          const numPax = Math.min(3 + (i % 4), students.length);
          for (let p = 0; p < numPax; p++) {
            await TripParticipant.create({
              trip_id: trip.id,
              student_id: students[studentIdx % students.length].id,
              assigned_instructor_id: instructor.id
            });
            studentIdx++;
          }
          const count = await TripParticipant.count({ where: { trip_id: trip.id } });
          await trip.update({ current_participants: count });
        }
      }
    }
    console.log('✓ 今日/明日行程（大屏模拟）创建成功');

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
