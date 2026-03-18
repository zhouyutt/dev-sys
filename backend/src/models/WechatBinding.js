module.exports = (sequelize, DataTypes) => {
  const WechatBinding = sequelize.define(
    "WechatBinding",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      openid: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true
      },
      unionid: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      role_type: {
        type: DataTypes.ENUM("guest", "staff", "owner"),
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id"
        }
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "students",
          key: "id"
        }
      },
      nickname: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      avatar_url: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "wechat_bindings",
      indexes: [{ fields: ["role_type"] }, { fields: ["user_id"] }, { fields: ["student_id"] }]
    }
  );

  return WechatBinding;
};
