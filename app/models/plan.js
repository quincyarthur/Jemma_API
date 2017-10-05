'use strict';
module.exports = function(sequelize, DataTypes) {
  var plan = sequelize.define('Plan', {
    plan_name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    num_accounts:DataTypes.INTEGER,
    num_keywords:DataTypes.INTEGER,
    account_update_interval:DataTypes.INTEGER,
    competitor_analysis:DataTypes.BOOLEAN
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