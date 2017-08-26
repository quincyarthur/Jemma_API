'use strict';
module.exports = function(sequelize, DataTypes) {
  var purchase_history = sequelize.define('Purchase_History', {
    user_id: DataTypes.INTEGER,
    subscription_id: DataTypes.INTEGER,
    payment_method: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return purchase_history;
};