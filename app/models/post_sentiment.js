'use strict';
module.exports = function(sequelize, DataTypes) {
  var Post_Sentiment = sequelize.define('Post_Sentiment', {
    page_id: DataTypes.INTEGER,
    post_id: DataTypes.STRING,
    keyword: DataTypes.STRING,
    last_post_id: DataTypes.INTEGER,
    tone_score: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      underscored: true
    }
  });
  return Post_Sentiment;
};