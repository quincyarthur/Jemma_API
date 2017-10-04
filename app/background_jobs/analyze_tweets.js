require('dotenv').config({path: '../../.env'});
const models = require('../../app/models/db');
const watson_language = require('../services/language_analyzer');
const watson_tone = require('../services/tone_analyzer');
const twitter_service =  require('../services/twitter');
 
function analyze_tweets(accounts){

    return Promise.resolve(accounts)
    .then((accounts)=>{
        //loop through the user twitter accounts
        for (let x = 0; x < accounts.length; x++){
        //loop through the pages tied to twitter accounts
            for (let y = 0; y < accounts[x].user_pages.length; y++){
                let twitter = new twitter_service.Twitter();
                return Promise.all([models.keyword_sentiment.findOne({where:{page_id:accounts[x].user_pages[y].id}
                                                                },{order:'created_at DESC'}),
                                    twitter.getUserProfileInfo(accounts[x].user_account.account_id,
                                                                accounts[x].user_account.token_key,
                                                                accounts[x].user_account.token_secret)
                                    ])
                .then((results)=>{
                    let since_id = '';

                    if (results[0]){
                        since_id = results[0].last_post_id;
                    }
                    //To Do: add user access token and access key 
                    //return new Promise((resolve,reject) =>{twitter.get_tweets(resolve,reject,'',results[1][0].screen_name,results[1][0].name)});
                    return new Promise((resolve,reject) =>{twitter.get_tweets(resolve,reject,since_id,'@walmart','walmart')}); //testing on
                })
                .then((results)=>{
                    let language_analyzer = new watson_language.LanguageAnalyzer();
                    let tone_analyzer = new watson_tone.ToneAnalyzer();

                    if (accounts[x].user_pages[y].keywords){
                        language_analyzer.params.features.sentiment.targets = language_analyzer.params.features.sentiment.targets.concat(accounts[x].user_pages[y].keywords.toString().split(','));
                    }

                    return Promise.all([language_analyzer.load_text(results.array),
                                        tone_analyzer.load_text(results.array)
                                        ])
                    .then((batch_text)=>{
                    return Promise.all([Promise.all(batch_text[0].map((text) => 
                                                        {return language_analyzer.analyze_text(text);})),
                                        Promise.all(batch_text[1].map((text) => 
                                                        {return tone_analyzer.analyze_text(text);}))
                                        ]);
                    })
                    .then((tone_elements)=>{
                        return Promise.all([Promise.all(tone_elements[0][0].sentiment.targets.map((target) =>{
                                                            return  accounts[x].user_pages[y].createKeyword_Sentiment({keyword:target.text,
                                                                last_post_id: results.max_id,
                                                                tone_score:target.score
                                                            })
                                                        })),
                                            Promise.all(tone_elements[1][0].map((audience) =>{
                                                            return  accounts[x].user_pages[y].createMention_Tone({tone:audience.tone,
                                                                last_post_id: results.max_id,
                                                                post:audience.text
                                                            })
                                                        }))
                                           ]);
                    })
                    .then((created_records)=>{
                        console.log('Page Tones Successfully Updated');
                        return models.user.findById(accounts[x].user_account.user_id);
                    })
                    .then((user)=>{
                        return user.update({last_updated:new Date});
                    })
                    .then((updated_user)=>{
                        console.log(`User id: ${updated_user.first_name} Account Successfully Updated`);
                    })
                    .catch((error)=>{
                        console.log(error);
                    });
                })
                .catch((error)=>{
                    console.log(error);
                });
            }
        }
    })
    .catch((error)=>{
        console.log(error);
    });
}

module.exports = {
    analyze_tweets:analyze_tweets
}
