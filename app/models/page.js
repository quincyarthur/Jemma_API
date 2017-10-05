'use strict';
module.exports = function(sequelize, DataTypes) {
  var page = sequelize.define('Page', {
    group_id: DataTypes.INTEGER,
    managed_page_id: DataTypes.STRING,
    keywords: { type : DataTypes.ARRAY(DataTypes.TEXT), defaultValue: null}
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return page;
};