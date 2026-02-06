module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    course_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '课程代码'
    },
    course_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '课程名称'
    },
    course_name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '课程英文名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '课程描述'
    },
    certification_org: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '认证机构（PADI/SSI等）'
    },
    level: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '课程级别'
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '课程天数'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '课程价格'
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'MYR',
      comment: '货币单位'
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '课程要求'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: '课程状态'
    }
  }, {
    tableName: 'courses',
    indexes: [
      { fields: ['course_code'] },
      { fields: ['status'] }
    ]
  });

  return Course;
};
