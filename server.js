//import modules
require('dotenv').config();
const express = require('express');
const app = express();
const router = express.Router();
const cors = require('cors');
const parser = require('body-parser');
const morgan = require('morgan')

//import services
const passport = require('./app/services/passport')();
const watson_tone = require('./app/services/tone_analyzer');
const tone_analyzer = new watson_tone.ToneAnalyzer();
const watson_language = require('./app/services/language_analyzer');
const language_analyzer = new watson_language.LanguageAnalyzer();
const twitter = require('./app/services/twitter')
const twitter_service = new twitter.TwitterService();

//import routes
const user_routes = require('./app/routes/user');
const auth_routes = require('./app/routes/auth');

//import models
const models = require('./app/models/db');
//const passport = require('passport');

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(morgan('dev'));
app.use('/api/v1',router);
router.use('/user',user_routes);
router.use('/auth',auth_routes);

var sample_text = 'Jet Blue is always late and their cutomer service sucks';

/*var router = require('./app/routes')(app);
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the beginning of nothingness.',
}));*/

/*
app.get('/api/tweets',(req,res)=>{
    let tweet_array = [];
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0
    let yyyy = today.getFullYear();
    today = yyyy + '-'+ mm + '-' + dd;
    twitter_service.params.q = `(@walmart since:${today} OR #walmart since:${today} OR walmart since:${today}) 
                                 AND (source:"Twitter for Android" OR source:"Twitter for iPhone" OR source:tweetdeck OR source:web)
                                 AND (-filter:retweets) AND (-filter:replies)`;
    
    new Promise((resolve,reject)=>{
        twitter_service.get_tweets(resolve,reject);
    })
    .then((array)=>{
        return language_analyzer.load_text(array);
    })
    .then((batch_text)=>{
      var tone_elements = Promise.all(batch_text.map((text) => 
                                        {return language_analyzer.analyze_text(text);}));
      return tone_elements;
    })
    .then((tone_elements)=>{
        res.json(tone_elements);
    })
    .catch((error)=>{
        console.log(error);
    })
});

app.post('/api/language_analyzer',(req,res)=>{
    language_analyzer.params.text = sample_text;
    language_analyzer.analyzer.analyze(language_analyzer.params, function(error, response) {
        if (error){
            return res.json({'error':error},null,2);
        }  
        else{
            return res.json(response);
        }
    })
});

app.post('/api/tone_analyzer',(req,res) => {
    tone_analyzer.params.text = sample_text;
    tone_analyzer.analyzer.tone(tone_analyzer.params,(error,response) =>{
        if (error){
          return res.json({'error':error},null,2);
        }
        else {
          for(let a = 0; a < response.document_tone.tone_categories.length;a++){
              var tone_categories = response.document_tone.tone_categories[a];
              return res.json({'tones':tone_categories.tones},null,2);
          }
        }
    });
});*/


models.sequelize.sync().then(function() {
  app.listen(3000,()=>{
      console.log('Server listening on port 3000');
  });
  //app.on('error', onError);
  //app.on('listening', onListening);
});

module.exports = app;