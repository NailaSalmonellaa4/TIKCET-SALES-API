'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tickets', {
      ticketID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eventID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'events', key: 'eventID' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'userID' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      seatID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'seats', key: 'seatID' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_diskon: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'diskons', key: 'id_diskon' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      totalPrice: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      bookedDate: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tickets');
  }
};
