'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subdistricts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      subdistrict_id: {
        type: Sequelize.STRING,
        allowNull: false
      },

      province_id: {
        type: Sequelize.STRING,
        allowNull: false
      },

      province: {
        type: Sequelize.STRING,
        allowNull: false
      },

      city_id: {
        type: Sequelize.STRING,
        allowNull: false
      },

      city: {
        type: Sequelize.STRING,
        allowNull: false
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false
      },

      subdistrict_name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subdistricts');
  }
};
