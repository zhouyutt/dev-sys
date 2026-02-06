require('dotenv').config();
const { 
  Trip,
  TripParticipant,
  Student,
  Boat,
  Staff,
  sequelize
} = require('../models');

// 生成今日行程数据
const generateTodayTrips = async () => {
  try {
    console.log('开始生成今日行程数据...');

    const today = new Date().toISOString().split('T')[0];
    
    // 清空今日行程
    await TripParticipant.destroy({ where: {} });
    await Trip.destroy({ where: { trip_date: today } });
    
    // 获取资源
    const boats = await Boat.findAll();
    const captains = await Staff.findAll({ where: { role: 'captain' } });
    const dms = await Staff.findAll({ where: { role: 'dm' } });
    const instructors = await Staff.findAll({ where: { role: 'instructor' } });
    const students = await Student.findAll({ limit: 20 });

    const destinations = ['Mabul Island', 'Mataking Island', 'Sipadan', 'Si Amil Island'];
    
    // 为每个目的地生成1-2个行程
    const trips = [];
    for (const destination of destinations) {
      const tripsCount = Math.floor(Math.random() * 2) + 1; // 1-2个行程
      
      for (let i = 0; i < tripsCount; i++) {
        const boat = boats[Math.floor(Math.random() * boats.length)];
        const captain = captains[Math.floor(Math.random() * captains.length)];
        const dm = dms[Math.floor(Math.random() * dms.length)];
        const instructor = instructors[Math.floor(Math.random() * instructors.length)];
        
        const departureHour = 7 + i * 2; // 7:00, 9:00, etc.
        const returnHour = departureHour + 6; // 6小时后返回
        
        const trip = await Trip.create({
          trip_date: today,
          destination: destination,
          boat_id: boat.id,
          captain_id: captain.id,
          dm_id: dm.id,
          instructor_id: instructor.id,
          departure_time: `${departureHour.toString().padStart(2, '0')}:00:00`,
          return_time: `${returnHour.toString().padStart(2, '0')}:00:00`,
          max_participants: boat.max_capacity,
          current_participants: 0,
          status: 'scheduled',
          notes: `${destination} - ${boat.boat_name}`
        });
        
        trips.push(trip);
        console.log(`✓ 创建行程: ${destination} - ${boat.boat_name}`);
      }
    }
    
    // 为每个行程分配学生
    let studentIndex = 0;
    for (const trip of trips) {
      // 每个行程分配3-6个学生
      const participantCount = Math.floor(Math.random() * 4) + 3;
      
      for (let i = 0; i < participantCount && studentIndex < students.length; i++) {
        await TripParticipant.create({
          trip_id: trip.id,
          student_id: students[studentIndex].id,
          assigned_instructor_id: trip.instructor_id
        });
        studentIndex++;
        
        // 如果学生用完了，重新开始
        if (studentIndex >= students.length) {
          studentIndex = 0;
        }
      }
      
      // 更新行程参与人数
      const actualCount = await TripParticipant.count({ where: { trip_id: trip.id } });
      await trip.update({ current_participants: actualCount });
      
      console.log(`✓ 为行程分配了 ${actualCount} 个学生`);
    }

    console.log('\n=================================');
    console.log('✓ 今日行程数据生成完成！');
    console.log('=================================');
    console.log(`今日行程数量: ${trips.length}`);
    console.log(`目的地分布:`);
    for (const dest of destinations) {
      const count = trips.filter(t => t.destination === dest).length;
      console.log(`  - ${dest}: ${count}个行程`);
    }
    console.log('=================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('生成今日行程数据失败:', error);
    console.error('错误:', error);
    process.exit(1);
  }
};

generateTodayTrips();
