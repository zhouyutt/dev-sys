module.exports = (sequelize, DataTypes) => {
  const TripParticipant = sequelize.define('TripParticipant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'trips',
        key: 'id'
      },
      comment: '行程ID'
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      },
      comment: '学员ID'
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
      defaultValue: 'confirmed',
      comment: '参与状态'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'trip_participants',
    indexes: [
      { fields: ['trip_id'] },
      { fields: ['student_id'] },
      { unique: true, fields: ['trip_id', 'student_id'] }
    ]
  });

  return TripParticipant;
};
