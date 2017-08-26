'use strict';
module.exports = function(sequelize, DataTypes) {
  var Account_Page = sequelize.define('Account_Page', {
    user_account_id: DataTypes.INTEGER,
    page_id: DataTypes.INTEGER
  }, {
    /*classMethods: {
      associate: function(models) {
        Account_Page.belongsTo(models.User_Account);
        Account_Page.belongsTo(models.Page);
      }
    }*/
    underscored: true
  });
  return Account_Page;
};