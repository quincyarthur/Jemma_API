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
    let flattened = [].concat.apply([],accounts);
    return flattened;
})
.then((accounts)=>{
    for (let x = 0; x < accounts.length; x++){
        console.log(`lets see with multiple users ${JSON.stringify(accounts[x].User_Account.user_id)}`)
        let twitter = new twitter_service.Twitter();
        twitter.getUserProfileInfo(accounts[x].User_Account.account_id,accounts[x].User_Account.token_key,accounts[x].User_Account.token_secret)
        .then((handles)=>{
            //return new Promise((resolve,reject) =>{twitter.get_tweets(resolve,reject,'',handles[0].screen_name,handles[0].name)});
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
                for(let i = 0; i < tone_elements[0].sentiment.targets.length; i++){
                    accounts[x].User_Account.getPages()
                    .then((pages)=>{
                        //Twitter accounts only have one page will be different for other social media
                        return pages[0].createMention_Tone({keyword:tone_elements[0].sentiment.targets[i].text,
                            last_post_id: results.max_id,
                            tone_score:tone_elements[0].sentiment.targets[i].score
                            });
                    })
                    .then((success)=>{
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
})
.catch((error)=>{
    console.log(error);
});