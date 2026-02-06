module.exports = (sequelize, DataTypes) => {
  const Boat = sequelize.define('Boat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    boat_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '船号'
    },
    boat_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '船名'
    },
    boat_type: {
      type: DataTypes.ENUM('small', 'large'),
      allowNull: false,
      comment: '船型（小船/大船）'
    },
    max_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最大载客量'
    },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'out_of_service'),
      defaultValue: 'available',
      comment: '船只状态'
    },
    equipment: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '船上设备'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'boats',
    indexes: [
      { fields: ['boat_number'] },
      { fields: ['boat_type'] },
      { fields: ['status'] }
    ]
  });

  return Boat;
};
