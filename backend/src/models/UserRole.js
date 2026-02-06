module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User ID'
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Role ID'
    }
  }, {
    tableName: 'user_roles',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['role_id'] },
      { unique: true, fields: ['user_id', 'role_id'] }
    ]
  });

  return UserRole;
};
