'use strict';
module.exports = function(sequelize, DataTypes) {
  var post_tone = sequelize.define('Post_Tone', {
    page_id: DataTypes.INTEGER,
    post_id:DataTypes.STRING,
    tone: DataTypes.STRING,
    last_post_id: DataTypes.STRING,
    post: { type : DataTypes.ARRAY(DataTypes.TEXT), defaultValue: null}
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return post_tone;
};