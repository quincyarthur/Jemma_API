'use strict';
module.exports = function(sequelize, DataTypes) {
  var preference_type = sequelize.define('Preference_Type', {
    type: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return preference_type;
};