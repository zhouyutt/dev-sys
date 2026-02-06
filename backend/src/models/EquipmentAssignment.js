module.exports = (sequelize, DataTypes) => {
  const EquipmentAssignment = sequelize.define('EquipmentAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    equipment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'equipment',
        key: 'id'
      },
      comment: '装备ID'
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
    assigned_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '分配日期'
    },
    returned_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '归还日期'
    },
    status: {
      type: DataTypes.ENUM('assigned', 'returned', 'lost', 'damaged'),
      defaultValue: 'assigned',
      comment: '分配状态'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'equipment_assignments',
    indexes: [
      { fields: ['equipment_id'] },
      { fields: ['student_id'] },
      { fields: ['status'] },
      { fields: ['assigned_date'] }
    ]
  });

  return EquipmentAssignment;
};
