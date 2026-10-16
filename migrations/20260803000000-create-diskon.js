'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diskons', {
      id_diskon: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_diskon: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nominal: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      tanggal_berlaku: {
        type: Sequelize.DATE,
        allowNull: false
      },
      eventID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'events',
          key: 'eventID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('diskons');
  }
};
