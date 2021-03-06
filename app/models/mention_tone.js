'use strict';
module.exports = function(sequelize, DataTypes) {
  var mention_tone = sequelize.define('Mention_Tone', {
    page_id: DataTypes.INTEGER,
    tone: DataTypes.STRING,
    last_post_id: DataTypes.STRING,
    post: { type : DataTypes.ARRAY(DataTypes.TEXT), defaultValue: null}
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      underscored: true
    }
  });
  return mention_tone;
};