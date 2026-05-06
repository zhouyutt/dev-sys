module.exports = (sequelize, DataTypes) => {
  const PriceItem = sequelize.define('PriceItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.ENUM('course', 'activity', 'accommodation', 'transfer', 'surcharge', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    name_cn: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '如 person/day、room/night、trip'
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'MYR'
    },
    price_non_malaysian: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    price_malaysian: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_fuel_surcharge: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    apply_all_trip_types: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'price_items',
    indexes: [
      { fields: ['category'] },
      { fields: ['is_active'] },
      { fields: ['sort_order'] },
      { fields: ['is_fuel_surcharge'] }
    ]
  });

  return PriceItem;
};
