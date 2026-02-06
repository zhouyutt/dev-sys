module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Permission name (e.g., user:read, user:write)'
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Permission code for frontend'
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Resource type (e.g., user, role, menu)'
    },
    action: {
      type: DataTypes.ENUM('read', 'write', 'delete', 'all'),
      allowNull: false,
      comment: 'Action type'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Permission description'
    }
  }, {
    tableName: 'permissions',
    timestamps: true,
    indexes: [
      { fields: ['code'] },
      { fields: ['resource', 'action'] }
    ]
  });

  return Permission;
};
