'use strict';
module.exports = function(sequelize, DataTypes) {
  var Page_Group = sequelize.define('Page_Group', {
    page_id: DataTypes.INTEGER,
    group_id: DataTypes.INTEGER
  }, {
    /*classMethods: {
      associate: function(models) {
        Page_Group.belongsTo(models.Page);
        Page_Group.belongsTo(models.Group);
      }
    }*/
     underscored: true
  });
  return Page_Group;
};