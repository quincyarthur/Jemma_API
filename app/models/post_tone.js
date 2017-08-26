'use strict';
module.exports = function(sequelize, DataTypes) {
  var post_tone = sequelize.define('Post_Tone', {
    page_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER,
    tone_id: DataTypes.INTEGER,
    tone_score: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return post_tone;
};