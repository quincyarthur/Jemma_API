'use strict';
module.exports = function(sequelize, DataTypes) {
  var preference = sequelize.define('Preference', {
    user_id: DataTypes.INTEGER,
    preferences: DataTypes.JSON
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return preference;
};