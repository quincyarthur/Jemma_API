'use strict';
module.exports = function(sequelize, DataTypes) {
  var Post_Demographic = sequelize.define('Post_Demographic', {
    page_id: DataTypes.INTEGER,
    post_id: DataTypes.STRING,
    country: DataTypes.STRING,
    gender: DataTypes.STRING,
    count: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Post_Demographic;
};