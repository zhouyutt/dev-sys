require('dotenv').config();
const { 
  Student, 
  Trip,
  TripParticipant,
  Room,
  Boat,
  Staff,
  sequelize
} = require('../models');

// 生成随机日期
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// 生成模拟数据
const generateMockData = async () => {
  try {
    console.log('开始生成模拟数据...');

    // 1. 生成模拟学员数据
    const students = [];
    const chineseNames = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨帆', '赵敏', '孙悦', '周杰', '吴磊',
                          '郑爽', '冯波', '何晨', '宋佳', '韩梅', '邓超', '唐诗', '白雪', '蒋文', '袁丽'];
    const englishNames = ['Zhang Wei', 'Li Na', 'Wang Fang', 'Liu Yang', 'Chen Jing', 
                          'Yang Fan', 'Zhao Min', 'Sun Yue', 'Zhou Jie', 'Wu Lei',
                          'Zheng Shuang', 'Feng Bo', 'He Chen', 'Song Jia', 'Han Mei',
                          'Deng Chao', 'Tang Shi', 'Bai Xue', 'Jiang Wen', 'Yuan Li'];
    const courses = ['OW开放水域', 'AOW进阶开放水域', '救援潜水员', '体验潜水'];
    const statuses = ['学习中', '已完成', '待确认'];

    for (let i = 0; i < 20; i++) {
      const student = await Student.create({
        name: chineseNames[i],
        name_en: englishNames[i],
        gender: i % 3 === 0 ? 'female' : 'male',
        phone: `+60${Math.floor(100000000 + Math.random() * 900000000)}`,
        wechat: `wx${Math.floor(100000 + Math.random() * 900000)}`,
        passport_number: `E${Math.floor(10000000 + Math.random() * 90000000)}`,
        course_type: courses[Math.floor(Math.random() * courses.length)],
        emergency_contact: `紧急联系人${i + 1}`,
        emergency_phone: `+86${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        notes: i % 3 === 0 ? `备注信息 ${i + 1}` : null
      });
      students.push(student);
    }
    console.log(`✓ 已生成 ${students.length} 个学员数据`);

    // 2. 为部分学员分配房间（模拟不同入住情况）
    const rooms = await Room.findAll();
    
    // 清空所有房间的入住人数
    for (const room of rooms) {
      await room.update({ 
        status: 'available',
        current_occupancy: 0
      });
    }
    
    // 分配学员到房间，创造不同的入住情况
    let studentIndex = 0;
    for (let i = 0; i < rooms.length && studentIndex < students.length; i++) {
      const room = rooms[i];
      // 随机决定这个房间的入住人数：0（空房）、1-2（半满）、3（满房）
      const occupancyType = Math.floor(Math.random() * 4); // 0,1,2,3
      let occupantsCount;
      
      if (occupancyType === 0) {
        occupantsCount = 0; // 空房
      } else if (occupancyType === 1 || occupancyType === 2) {
        occupantsCount = Math.floor(Math.random() * 2) + 1; // 1-2人（半满）
      } else {
        occupantsCount = room.max_capacity; // 满房（3人）
      }
      
      // 分配学员到这个房间
      for (let j = 0; j < occupantsCount && studentIndex < students.length; j++) {
        await students[studentIndex].update({ 
          room_id: room.id,
          check_in_date: randomDate(new Date(2024, 0, 1), new Date())
        });
        studentIndex++;
      }
      
      // 更新房间状态
      await room.update({ 
        status: occupantsCount >= room.max_capacity ? 'occupied' : (occupantsCount > 0 ? 'partial' : 'available'),
        current_occupancy: occupantsCount
      });
    }
    console.log('✓ 已为学员分配房间（空房/半满/满房）');

    // 3. 获取船只和员工
    const boats = await Boat.findAll();
    const captains = await Staff.findAll({ where: { role: 'captain' } });
    const dms = await Staff.findAll({ where: { role: 'dm' } });
    const instructors = await Staff.findAll({ where: { role: 'instructor' } });

    // 4. 生成行程数据（使用英文目的地）
    const destinations = ['Mabul Island', 'Mataking Island', 'Sipadan', 'Si Amil Island'];
    const trips = [];

    // 生成过去7天和未来7天的行程
    for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
      const tripDate = new Date();
      tripDate.setDate(tripDate.getDate() + dayOffset);
      
      // 每天生成1-2个行程
      const tripsPerDay = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < tripsPerDay; i++) {
        const boat = boats[Math.floor(Math.random() * boats.length)];
        const captain = captains[Math.floor(Math.random() * captains.length)];
        const dm = dms[Math.floor(Math.random() * dms.length)];
        const instructor = Math.random() > 0.5 ? instructors[Math.floor(Math.random() * instructors.length)] : null;

        let status;
        if (dayOffset < 0) {
          status = 'completed'; // 过去的行程
        } else if (dayOffset === 0) {
          status = 'ongoing'; // 今天的行程
        } else {
          status = 'confirmed'; // 未来的行程
        }

        const trip = await Trip.create({
          trip_date: tripDate,
          destination: destinations[Math.floor(Math.random() * destinations.length)],
          boat_id: boat.id,
          captain_id: captain.id,
          dm_id: dm.id,
          instructor_id: instructor?.id || null,
          dive_count: Math.floor(Math.random() * 3) + 2, // 2-4次潜水
          status: status,
          max_participants: boat.max_capacity,
          notes: i === 0 ? `${tripDate.toLocaleDateString('zh-CN')} 的行程` : null
        });
        trips.push(trip);
      }
    }
    console.log(`✓ 已生成 ${trips.length} 个行程数据`);

    // 5. 为行程分配学员
    for (const trip of trips) {
      // 随机选择3-8个学员参加行程
      const participantCount = Math.floor(Math.random() * 6) + 3;
      const selectedStudents = [];
      
      // 随机选择不重复的学员
      while (selectedStudents.length < Math.min(participantCount, students.length)) {
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        if (!selectedStudents.includes(randomStudent)) {
          selectedStudents.push(randomStudent);
        }
      }

      // 添加学员到行程
      for (const student of selectedStudents) {
        await TripParticipant.create({
          trip_id: trip.id,
          student_id: student.id,
          assigned_instructor_id: trip.instructor_id
        });
      }

      // 更新行程的参与人数
      await trip.update({ 
        current_participants: selectedStudents.length 
      });
    }
    console.log('✓ 已为行程分配学员');

    console.log('\n=================================');
    console.log('✓ 模拟数据生成完成！');
    console.log('=================================');
    console.log(`学员数量: ${students.length}`);
    console.log(`行程数量: ${trips.length}`);
    console.log('=================================\n');

  } catch (error) {
    console.error('生成模拟数据失败:', error);
    throw error;
  }
};

// 执行生成
if (require.main === module) {
  generateMockData()
    .then(() => {
      console.log('完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('错误:', error);
      process.exit(1);
    });
}

module.exports = { generateMockData };
