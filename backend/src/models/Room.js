module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    room_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      comment: '房间号'
    },
    room_type: {
      type: DataTypes.STRING(50),
      defaultValue: '大床+单人床',
      comment: '房间类型'
    },
    max_capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      comment: '最大容纳人数'
    },
    current_occupancy: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '当前入住人数'
    },
    floor: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: '楼层（A或B）'
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '房间设施'
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'reserved'),
      defaultValue: 'available',
      comment: '房间状态'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'rooms',
    indexes: [
      { fields: ['room_number'] },
      { fields: ['status'] },
      { fields: ['floor'] }
    ]
  });

  return Room;
};
