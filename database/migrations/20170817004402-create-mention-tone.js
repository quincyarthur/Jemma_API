'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Mention_Tones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      page_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      keyword: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_post_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tone_score: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Mention_Tones');
  }
};