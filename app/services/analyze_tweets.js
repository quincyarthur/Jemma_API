require('dotenv').config({path: '../../.env'});
const models = require('../models/db');
const watson_language = require('../services/language_analyzer');
const twitter_service =  require('../services/twitter');
 /**
 * To Do:
 * 1) Get Last post id (done)
 * 2) Get Page keywords and add them to language analyzer targets (done)
 * 3) Clean up routes to get averages of tone scores (done-)
 * 4) Add CRUD functionalty to Keywords (done)
 */

models.user.addScope('subscription_user_accounts',{include:[{model:models.plan,where:{plan_name:'30 Day Free Trail'}},
                                                  {model:models.account_type,where:{description:'Twitter'}}]
                    })
models.user.scope('subscription_user_accounts').findAll()
.then((users)=>{
    let accounts = Promise.all(users.map((user)=>{
                        for (let x = 0; x < user.Account_Types.length; x++){
                            return new Promise((resolve,reject)=>{
                                user.Account_Types[x].User_Account.getPages()
                                .then((account_page)=>{
                                        resolve({user_account:user.Account_Types[x].User_Account,user_pages:account_page})
                                })
                                .catch((error)=>{
                                    reject(error);
                                })
                            }) 
                        }
                    }))
    return accounts;
})
.then((accounts)=>{
    //loop through user's accounts
    for (let x = 0; x < accounts.length; x++){
        //loop through the pages tied to user account
        for (let y = 0; y < accounts[x].user_pages.length; y++){
            //console.log(JSON.stringify(accounts[x].user_pages[y].keywords.toString().split(','),null,2))
            let twitter = new twitter_service.Twitter();
            return Promise.all([models.mention_tone.findOne({where:{page_id:accounts[x].user_pages[y].id}
                               },{order:'createdAt DESC'}),
                               twitter.getUserProfileInfo(accounts[x].user_account.account_id,
                                                          accounts[x].user_account.token_key,
                                                          accounts[x].user_account.token_secret)
            ])
            .then((results)=>{
                let since_id = '';
                if (results[0]){
                     results[0].last_post_id;
                }
                //return new Promise((resolve,reject) =>{twitter.get_tweets(resolve,reject,'',results[1][0].screen_name,results[1][0].name)});
                return new Promise((resolve,reject) =>{twitter.get_tweets(resolve,reject,since_id,'@walmart','walmart')}); //testing on
            })
            .then((results)=>{
                let language_analyzer = new watson_language.LanguageAnalyzer();
                if (accounts[x].user_pages[y].keywords){
                    language_analyzer.params.features.sentiment.targets = language_analyzer.params.features.sentiment.targets.concat(accounts[x].user_pages[y].keywords.toString().split(','));
                }
                language_analyzer.load_text(results.array)
                .then((batch_text)=>{
                    let tone_elements = Promise.all(batch_text.map((text) => 
                                                    {return language_analyzer.analyze_text(text);}));
                    return tone_elements;
                })
                .then((tone_elements)=>{
                    for(let z = 0; z < tone_elements[0].sentiment.targets.length; z++){
                            accounts[x].user_pages[y].createMention_Tone({keyword:tone_elements[0].sentiment.targets[z].text,
                                last_post_id: results.max_id,
                                tone_score:tone_elements[0].sentiment.targets[z].score
                            })
                            .then((mention_tone)=>{
                                console.log('Tones Successfully Added');
                            })
                            .catch((error)=>{
                                console.log(error);
                            })
                    }
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