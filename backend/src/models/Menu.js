module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Parent menu ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Menu name'
    },
    path: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Menu path'
    },
    component: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Component path'
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Menu icon'
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Display order'
    },
    visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Is visible in menu'
    },
    permission: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Required permission code'
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'menus',
    timestamps: true,
    indexes: [
      { fields: ['parent_id'] },
      { fields: ['order'] },
      { fields: ['visible'] }
    ]
  });

  return Menu;
};
