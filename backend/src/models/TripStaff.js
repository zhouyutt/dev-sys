module.exports = (sequelize, DataTypes) => {
  const TripStaff = sequelize.define('TripStaff', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'trips', key: 'id' }
    },
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'staff', key: 'id' }
    },
    role: {
      type: DataTypes.ENUM('captain', 'dm', 'instructor'),
      allowNull: false,
      comment: '该员工在此行程中的角色'
    }
  }, {
    tableName: 'trip_staff',
    indexes: [
      { fields: ['trip_id'] },
      { fields: ['staff_id'] },
      { unique: true, fields: ['trip_id', 'staff_id', 'role'] }
    ]
  });

  return TripStaff;
};
