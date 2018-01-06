'use strict';
module.exports = function(sequelize, DataTypes) {
  var Group = sequelize.define('Group', {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    categories: { type : DataTypes.ARRAY(DataTypes.TEXT), defaultValue: null},
    description: DataTypes.STRING
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