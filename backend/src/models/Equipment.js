module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    equipment_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '装备编号'
    },
    equipment_type: {
      type: DataTypes.ENUM('bcd', 'regulator', 'wetsuit', 'fins', 'mask', 'tank', 'weight', 'computer', 'other'),
      allowNull: false,
      comment: '装备类型'
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '品牌'
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '型号'
    },
    size: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '尺寸'
    },
    condition: {
      type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'maintenance'),
      defaultValue: 'good',
      comment: '装备状况'
    },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'retired'),
      defaultValue: 'available',
      comment: '装备状态'
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '购买日期'
    },
    last_service_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '最后维护日期'
    },
    next_service_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '下次维护日期'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'equipment',
    indexes: [
      { fields: ['equipment_code'] },
      { fields: ['equipment_type'] },
      { fields: ['status'] },
      { fields: ['condition'] }
    ]
  });

  return Equipment;
};
