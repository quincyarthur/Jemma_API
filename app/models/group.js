'use strict';
module.exports = function(sequelize, DataTypes) {
  var Group = sequelize.define('Group', {
    group_name: DataTypes.STRING
  }, {
    /*classMethods: {
      associate: function(models) {
       Group.hasMany(models.Page_Group);
      }
    }*/
     underscored: true
  });
  return Group;
};