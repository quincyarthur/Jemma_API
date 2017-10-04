'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        lowercase: true,
        trim:true
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
        lowercase: true,
        trim:true
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
        lowercase: true,
        trim:true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        lowercase: true,
        trim:true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        lowercase: true,
        trim:true
      },
      confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      lasted_updated: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};