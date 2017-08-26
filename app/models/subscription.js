'use strict';
module.exports = function(sequelize, DataTypes) {
  var subscription = sequelize.define('Subscription', {
    user_id: DataTypes.INTEGER,
    plan_id: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return subscription;
};