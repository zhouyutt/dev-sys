module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Role name (e.g., admin, manager, staff)'
    },
    name_cn: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Chinese name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Role description'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: 'Role status'
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['status'] }
    ]
  });

  return Role;
};
