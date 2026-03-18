module.exports = (sequelize, DataTypes) => {
  const MiniappOperationLog = sequelize.define(
    "MiniappOperationLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      binding_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "wechat_bindings",
          key: "id"
        }
      },
      operator_role: {
        type: DataTypes.ENUM("guest", "staff", "owner"),
        allowNull: false
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      tableName: "miniapp_operation_logs",
      indexes: [{ fields: ["binding_id"] }, { fields: ["action"] }]
    }
  );

  return MiniappOperationLog;
};
