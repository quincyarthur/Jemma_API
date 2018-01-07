'use strict';
module.exports = function(sequelize, DataTypes) {
  var group_member = sequelize.define('Group_Member', {
    user_id: DataTypes.INTEGER,
    group_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    underscored: true
  });
  return group_member;
};