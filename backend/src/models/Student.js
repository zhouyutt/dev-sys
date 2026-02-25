module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    guest_id: {
      type: DataTypes.STRING(32),
      allowNull: true,
      unique: true,
      comment: '客人唯一编号，用于扫码/行程关联'
    },
    // 基本信息
    name_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '英文姓名'
    },
    name_cn: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '中文姓名'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '出生日期'
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '国籍'
    },
    
    // 联系方式
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    wechat: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '微信号'
    },
    
    // 护照信息
    passport_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '护照号码'
    },
    passport_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '护照过期日期'
    },
    passport_photo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '护照照片URL'
    },
    
    // 课程信息
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    learning_content: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '参与内容：OW, AOW, OW+AOW, FunDive, DSD, Snorkeling, Razor Side-mounted, Tech 40, Tech 50'
    },
    instructor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'staff',
        key: 'id'
      },
      comment: '分配的教练ID'
    },
    certification_level: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '现有证书等级'
    },
    
    // 住宿信息
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'rooms',
        key: 'id'
      }
    },
    check_in_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '入住日期'
    },
    check_out_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '退房日期'
    },
    
    // 其他信息
    emergency_contact: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '紧急联系人'
    },
    emergency_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '紧急联系电话'
    },
    medical_conditions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '医疗状况'
    },
    special_requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '特殊要求'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    
    // 状态
    status: {
      type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
      defaultValue: 'pending',
      comment: '学员状态'
    },
    enrollment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '报名日期'
    }
  }, {
    tableName: 'students',
    indexes: [
      { fields: ['guest_id'] },
      { fields: ['passport_number'] },
      { fields: ['course_id'] },
      { fields: ['room_id'] },
      { fields: ['instructor_id'] },
      { fields: ['status'] },
      { fields: ['check_in_date'] },
      { fields: ['check_out_date'] }
    ]
  });

  return Student;
};
