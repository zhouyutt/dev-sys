module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    trip_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '出海日期'
    },
    boat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'boats',
        key: 'id'
      },
      comment: '船只ID'
    },
    destination: {
      type: DataTypes.ENUM('Mabul Island', 'Mataking Island', 'Sipadan', 'Si Amil Island'),
      allowNull: false,
      comment: '目的地'
    },
    captain_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'staff',
        key: 'id'
      },
      comment: '船长ID'
    },
    dm_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'staff',
        key: 'id'
      },
      comment: 'DM ID'
    },
    instructor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'staff',
        key: 'id'
      },
      comment: '教练ID'
    },
    departure_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: '出发时间'
    },
    return_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: '返回时间'
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '最大参与人数'
    },
    current_participants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '当前参与人数'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
      comment: '行程状态'
    },
    weather: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '天气情况'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'trips',
    indexes: [
      { fields: ['trip_date'] },
      { fields: ['boat_id'] },
      { fields: ['destination'] },
      { fields: ['status'] }
    ]
  });

  return Trip;
};
