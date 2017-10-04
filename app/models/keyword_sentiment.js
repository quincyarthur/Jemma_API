'use strict';
module.exports = function(sequelize, DataTypes) {
  var keyword_sentiment = sequelize.define('Keyword_Sentiment', {
    page_id: DataTypes.INTEGER,
    keyword: DataTypes.STRING,
    last_post_id: DataTypes.STRING,
    tone_score: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
     underscored: true
  });
  return keyword_sentiment;
};