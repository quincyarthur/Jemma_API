require('dotenv').config({path: '../../.env'});
const models = require('../../app/models/db');
const watson_language = require('../services/language_analyzer');
const watson_tone = require('../services/tone_analyzer');
const facebook_service =  require('../services/facebook');
const fb = new facebook_service.Facebook();

function analyze_fb(accounts){
    return Promise.resolve(accounts)
    .then((accounts)=>{
        //loop through the user facebook accounts
        for (let x = 0; x < accounts.length; x++){
        //loop through the pages tied to facebook accounts
            for (let y = 0; y < accounts[x].user_pages.length; y++){
                accounts[x].user_pages[y].getMention_Tones({order: [['created_at','DESC']]})
                .then((last_mentions)=>{
                    console.log(`Last Mentions: ${JSON.stringify(last_mentions,null,2)}`)
                    let last_post = ''
                    if (last_mentions.length > 0){
                        last_post = last_mentions[0].last_post_id;
                    }
                    return fb.get_page_mentions(accounts[x].user_account.token_key,accounts[x].user_pages[y].managed_page_id,last_post);
                })
                .then((user_posts)=>{
                    if(user_posts.length <= 0){
                        return Promise.reject('Page does not have any mentions');
                    }
                    //posts are sorted in reverse chronological order
                    //so first post is the latest
                    //api doesnt allow searching from the last id but it does all you 
                    // to search comments made "since" a particular date/time
                    let last_comment_date = user_posts[0].tagged_time;
                    let results = {user_posts:user_posts,last_comment_date:last_comment_date}
                    return results;
                })
                .then((results)=>{
                    let arr_mentions = results.user_posts.map((post)=>{return post.message}); //get the text of page mentions
                    let language_analyzer = new watson_language.LanguageAnalyzer();
                    let tone_analyzer = new watson_tone.ToneAnalyzer();

                    if (accounts[x].user_pages[y].keywords){
                        language_analyzer.params.features.sentiment.targets = language_analyzer.params.features.sentiment.targets.concat(accounts[x].user_pages[y].keywords.toString().split(','));
                    }

                    return Promise.all([language_analyzer.load_text(arr_mentions),
                                        tone_analyzer.load_text(arr_mentions)
                           ])
                    .then((batch_text)=>{
                            return Promise.all([Promise.all(batch_text[0].map((text) => 
                                                {return language_analyzer.analyze_text(text);})),
                                    Promise.all(batch_text[1].map((text) => 
                                                    {return tone_analyzer.analyze_text(text);}))
                                    ]);
                    })
                    .then((tone_elements)=>{
                        //console.log(`Demo Info: ${JSON.stringify(tone_elements,null,2)}`)
                        if('sentiment' in tone_elements[0][0] && tone_elements[1][0].length > 0 ){
                            return Promise.all([Promise.all(tone_elements[0][0].sentiment.targets.map((target) =>{
                                        return accounts[x].user_pages[y].createKeyword_Sentiment({keyword:target.text,
                                            last_post_id: results.last_comment_date,
                                            tone_score:target.score
                                        })
                                    })),
                                    Promise.all(tone_elements[1][0].map((audience) =>{
                                                return accounts[x].user_pages[y].createMention_Tone({tone:audience.tone,
                                                    last_post_id: results.last_comment_date,
                                                    post:audience.text
                                                })
                                            }))
                            ]);
                        }
                        else if ('sentiment' in tone_elements[0][0]){
                            return Promise.all([Promise.all(tone_elements[0][0].sentiment.targets.map((target) =>{
                                        return accounts[x].user_pages[y].createKeyword_Sentiment({keyword:target.text,
                                            last_post_id: results.last_comment_date,
                                            tone_score:target.score
                                        })
                                    }))
                            ]);
                        }
                        else if (tone_elements[1][0].length > 0){
                            return Promise.all([
                                Promise.all(tone_elements[1][0].map((audience) =>{
                                    return accounts[x].user_pages[y].createMention_Tone({tone:audience.tone,
                                        last_post_id: results.last_comment_date,
                                        post:audience.text
                                    })
                                }))
                            ])
                        }
                        else{
                            return null;
                        }
                    })
                    .then((created_records)=>{
                        if(created_records){
                            console.log('Page Tones Successfully Updated');
                            return models.user.findById(accounts[x].user_account.user_id);
                        }
                        else{
                            return Promise.reject('No targets or tones found');
                        }  
                    })
                    .then((user)=>{
                        return user.update({lasted_updated:new Date});
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
                })

            }
        }
    })
    .catch((error)=>{
        console.log(error);
    })
}

module.exports = {
    analyze_fb:analyze_fb
}