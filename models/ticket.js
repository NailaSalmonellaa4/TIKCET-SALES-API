'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, {
        foreignKey: 'userID',
        as: 'ticketUser'
      });
      this.belongsTo(models.event, {
        foreignKey: 'eventID',
        as: 'ticketEvent'
      });
      this.belongsTo(models.seat, {
        foreignKey: 'seatID',
        as: 'ticketSeat'
      });
      this.belongsTo(models.diskon, {
        foreignKey: 'id_diskon',
        as: 'ticketDiskon'
      });
    }
  }
  ticket.init({
    ticketID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    eventID: DataTypes.INTEGER,
    userID: DataTypes.INTEGER,
    seatID: DataTypes.INTEGER,
    id_diskon: DataTypes.INTEGER,
    totalPrice: DataTypes.DOUBLE,
    bookedDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ticket',
  });
  return ticket;
};