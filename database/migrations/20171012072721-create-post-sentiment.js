'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Post_Sentiments', {
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
      post_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      keyword: {
        type: Sequelize.STRING
      },
      last_post_id: {
        type: Sequelize.INTEGER
      },
      tone_score: {
        type: Sequelize.FLOAT
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
    return queryInterface.dropTable('Post_Sentiments');
  }
};