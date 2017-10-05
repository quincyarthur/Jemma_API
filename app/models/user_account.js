'use strict';
module.exports = function(sequelize, DataTypes) {
  var User_Account = sequelize.define('User_Account', 
  {
    user_id: DataTypes.INTEGER,
    account_id: DataTypes.INTEGER,
    token_key: DataTypes.STRING,
    token_secret: DataTypes.STRING,
    account_type_id: DataTypes.INTEGER
  }, 
  {
    /*classMethods: {
      associate: function(models) {
         User_Account.belongsTo(models.User);
         User_Account.belongsTo(models.Account_Type);
         User_Account.hasMany(models.Account_Page);
      }
      }*/
      underscored: true
  });
  return User_Account;
};