'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class diskon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.event, {
        foreignKey: 'eventID',
        as: 'diskonEvent'
      });
      this.hasMany(models.ticket, {
        foreignKey: 'id_diskon',
        as: 'diskonTickets'
      });
    }
  }

  diskon.init({
    id_diskon: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    nama_diskon: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nominal: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    tanggal_berlaku: {
      type: DataTypes.DATE,
      allowNull: false
    },
    eventID: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'diskon',
    tableName: 'diskons'
  });

  return diskon;
};