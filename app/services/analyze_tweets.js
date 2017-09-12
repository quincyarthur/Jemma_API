require('dotenv').config({path: '../../.env'});
const models = require('../models/db');
const watson_language = require('../services/language_analyzer');
const language_analyzer = new watson_language.LanguageAnalyzer();
const twitter_service =  require('../services/twitter');

models.user.findAll({include:[{model:models.plan,where:{plan_name:'30 Day Free Trail'}},
                              {model:models.account_type,where:{description:'Twitter'}}
                             ]
                    })
.then((users)=>{
    let accounts = users.map((user)=>{
        return user.Account_Types;
    })
    return accounts;
})
.then((accounts)=>{
    accounts[0].map((account)=>{
        let twitter = new twitter_service.Twitter();
        twitter.getUserProfileInfo(account.User_Account.account_id,account.User_Account.token_key,account.User_Account.token_secret)
        .then((handles)=>{
            console.log(`Handle: ${handles[0].screen_name}, Profile Name: ${handles[0].name}`);
            //return twitter.get_tweets(handles[0].screen_name,handles[0].name)
            return new Promise((resolve,reject) =>{twitter.get_tweets(resolve,reject,'','@walmart','walmart')}); //testing on
        })
        .then((results)=>{
            language_analyzer.load_text(results.array)
            .then((batch_text)=>{
                let tone_elements = Promise.all(batch_text.map((text) => 
                                                {return language_analyzer.analyze_text(text);}));
                return tone_elements;
            })
            .then((tone_elements)=>{
                for(let x = 0; x < tone_elements[0].sentiment.targets.length; x++){
                    account.getUser_Accounts()
                    .then((user_account)=>{
                            console.log(user_account[0])
                            return user_account[0].getPages()
                    })
                    .then((pages)=>{
                        console.log(results.max_id)
                        return pages[0].createMention_Tone({keyword:tone_elements[0].sentiment.targets[x].text,
                            last_post_id: results.max_id,
                            tone_score:tone_elements[0].sentiment.targets[x].score
                            });
                    })
                    .then((success)=>{
                        console.log('Tones Successfully Added');
                    })
                    .catch((error)=>{
                        console.log(error);
                    })
                }
                console.log(JSON.stringify(tone_elements,null,2));
            })
            .catch((error)=>{
                console.log(error);
            });
        })
        .catch((error)=>{
            console.log(error);
        });
    })
})
.catch((error)=>{
    console.log(error);
});