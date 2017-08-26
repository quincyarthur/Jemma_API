'use strict';
module.exports = function(sequelize, DataTypes) {
  var mention_tone = sequelize.define('Mention_Tone', {
    tone_id: DataTypes.INTEGER,
    last_post_id: DataTypes.STRING,
    tone_score: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return mention_tone;
};