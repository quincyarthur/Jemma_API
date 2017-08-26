'use strict';
module.exports = function(sequelize, DataTypes) {
  var plan = sequelize.define('Plan', {
    plan_name: DataTypes.STRING,
    price: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return plan;
};