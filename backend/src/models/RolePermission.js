module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Role ID'
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Permission ID'
    }
  }, {
    tableName: 'role_permissions',
    timestamps: false,
    indexes: [
      { fields: ['role_id'] },
      { fields: ['permission_id'] },
      { unique: true, fields: ['role_id', 'permission_id'] }
    ]
  });

  return RolePermission;
};
