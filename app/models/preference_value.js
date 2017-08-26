'use strict';
module.exports = function(sequelize, DataTypes) {
  var preference_value = sequelize.define('Preference_Value', {
    preference_name: DataTypes.STRING,
    preference_type_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    underscored: true
  });
  return preference_value;
};