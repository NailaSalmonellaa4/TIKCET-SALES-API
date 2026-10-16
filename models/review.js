'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class review extends Model {
    static associate(models) {
      // Setiap review dimiliki oleh satu user
      this.belongsTo(models.user, {
        foreignKey: 'userID',
        as: 'reviewUser'
      });
      // Setiap review terkait dengan satu event
      this.belongsTo(models.event, {
        foreignKey: 'eventID',
        as: 'reviewEvent'
      });
    }
  }

  review.init({
    reviewID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    eventID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'review',
  });

  return review;
};
