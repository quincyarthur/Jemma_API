'use strict';
module.exports = function(sequelize, DataTypes) {
  var Account_Type = sequelize.define('Account_Type', {
    description: DataTypes.ENUM('Twitter','Facebook','Instagram','Youtube')
  }, {
    /*classMethods: {
      associate: function(models) {
        Account_Type.hasMany(models.User_Account);
      }
    }*/
     underscored: true
  });
  return Account_Type;
};