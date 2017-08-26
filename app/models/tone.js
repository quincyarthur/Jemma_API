'use strict';
module.exports = function(sequelize, DataTypes) {
  var tone = sequelize.define('Tone', {
    tone_name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return tone;
};