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
                fb.get_page_posts(accounts[x].user_account.token_key,accounts[x].user_pages[y].managed_page_id)
                .then((posts)=>{
                    //remove status update posts i.e. Page updated their cover picture
                    let user_posts = posts.filter((post)=>{return 'message' in post});
                    return user_posts;
                })
                .then((user_posts)=>{
                    //get all the comments tied to a post
                    return Promise.all(user_posts.map((post)=>{
                        return new Promise((resolve,reject)=>{
                            fb.get_page_comments(accounts[x].user_account.token_key,post.id)
                            .then((comments)=>{
                                resolve({post:post.id,comments:comments})
                            })
                        })
                    }))     
                })
                .then((post_comments)=>{
                    //remove posts with no comments
                   return post_comments.filter((pc)=>{return pc.comments.length > 0});
                })
                .then((post_with_comments)=>{
                    //console.log(`Page: ${JSON.stringify(post_with_comments,null,2)}`);
                    //all posts posted by a particular page that have comments
                    for (let a = 0; a < post_with_comments.length; a++){
                        let arr_comments = []
                        //comments within a particular post
                        for(b = 0;b < post_with_comments[a].comments.length; b++){
                            arr_comments.push(post_with_comments[a].comments[b].message)
                        }

                        if(arr_comments.length <= 0){
                            return Promise.reject('Post does not have any comments');
                        }
                        
                        let language_analyzer = new watson_language.LanguageAnalyzer();
                        let tone_analyzer = new watson_tone.ToneAnalyzer();
    
                        if (accounts[x].user_pages[y].keywords){
                            language_analyzer.params.features.sentiment.targets = language_analyzer.params.features.sentiment.targets.concat(accounts[x].user_pages[y].keywords.toString().split(','));
                        }
    
                        return Promise.all([language_analyzer.load_text(arr_comments),
                                            tone_analyzer.load_text(arr_comments)
                                            ])
                        .then((batch_text)=>{
                        return Promise.all([Promise.all(batch_text[0].map((text) => 
                                                            {return language_analyzer.analyze_text(text);})),
                                            Promise.all(batch_text[1].map((text) => 
                                                            {return tone_analyzer.analyze_text(text);}))
                                            ]);
                        })
                        .then((tone_elements)=>{
                            console.log(`Tone Elements: ${JSON.stringify(tone_elements[0][0],null,2)}`)
                            if('sentiment' in tone_elements[0][0]){
                                return Promise.all([Promise.all(tone_elements[0][0].sentiment.targets.map((target) =>{
                                            return  accounts[x].user_pages[y].createPost_Sentiment({keyword:target.text,
                                                post_id: post_with_comments[a].post,
                                                last_post_id: 'Dummy Text',
                                                tone_score:target.score
                                            })
                                        })),
                                        Promise.all(tone_elements[1][0].map((audience) =>{
                                                    return  accounts[x].user_pages[y].createPost_Tone({tone:audience.tone,
                                                        post_id: post_with_comments[a].post,
                                                        last_post_id: 'Dummy Text',
                                                        post:audience.text
                                                    })
                                                }))
                                ]);
                            }
                            else{
                                return Promise.all([
                                    Promise.all(tone_elements[1][0].map((audience) =>{
                                        return  accounts[x].user_pages[y].createPost_Tone({tone:audience.tone,
                                            post_id: post_with_comments[a].post,
                                            last_post_id: 'Dummy Text',
                                            post:audience.text
                                        })
                                    }))
                                ])
                            }   
                        })
                        .then((created_records)=>{
                            console.log('Page Tones Successfully Updated');
                            return models.user.findById(accounts[x].user_account.user_id);
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

                    }
                    //console.log(`Comment Array: ${JSON.stringify(arr_comments,null,2)}`);
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