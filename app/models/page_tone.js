'use strict';
module.exports = function(sequelize, DataTypes) {
  var page_tone = sequelize.define('Page_Tone', {
    page_id: DataTypes.INTEGER,
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
  return page_tone;
};