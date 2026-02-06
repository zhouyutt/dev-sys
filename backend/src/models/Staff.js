module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '姓名'
    },
    name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '英文姓名'
    },
    role: {
      type: DataTypes.ENUM('captain', 'dm', 'instructor', 'staff'),
      allowNull: false,
      comment: '角色（船长/DM/教练/员工）'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '电话'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    certifications: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '证书资质'
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '语言能力'
    },
    specialties: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '专长'
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '入职日期'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on_leave'),
      defaultValue: 'active',
      comment: '员工状态'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'staff',
    indexes: [
      { fields: ['role'] },
      { fields: ['status'] }
    ]
  });

  return Staff;
};
