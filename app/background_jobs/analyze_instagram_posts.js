require('dotenv').config({path: '../../.env'});
const models = require('../../app/models/db');
const watson_language = require('../services/language_analyzer');
const watson_tone = require('../services/tone_analyzer');
const ig =  require('../services/instagram');

function analyze_fb(accounts){
    return Promise.resolve(accounts)
    .then((accounts)=>{
        //loop through the user facebook accounts
        for (let x = 0; x < accounts.length; x++){
        //loop through the pages tied to facebook accounts
            for (let y = 0; y < accounts[x].user_pages.length; y++){
                ig.get_posts(accounts[x].user_account.token_key)
                .then((user_posts)=>{
                    //get all the comments tied to a post
                    return Promise.all(user_posts.map((post)=>{
                        return new Promise((resolve,reject)=>{
                            models.post_tone.findOne({where:{post_id:post.id}},{order:'created_at DESC'})
                            .then((lastest_post_tone)=>{
                                let last_comment = '';

                                if (lastest_post_tone){
                                    last_comment =  lastest_post_tone.last_post_id;
                                }
                                return ig.get_post_comments(accounts[x].user_account.token_key,post.id,last_comment)
                            })
                            .then((comments)=>{
                                resolve({post:post.id,comments:comments})
                            })
                            .catch((error)=>{
                                console.log(error);
                            })
                        })
                    }))     
                })
                .then((post_comments)=>{
                    //remove posts with no comments
                   return post_comments.filter((pc)=>{return pc.comments.length > 0});
                })
                .then((post_with_comments)=>{

                    if(post_with_comments.length <= 0){
                        return Promise.reject('Post does not have any comments');
                    }
                    //all posts posted by a particular page that have comments
                    for (let a = 0; a < post_with_comments.length; a++){
                        let arr_comments = [];
                        let arr_comment_users = [];
                        var last_comment_date = '';
                        //comments within a particular post
                        for(b = 0;b < post_with_comments[a].comments.length; b++){
                            arr_comments.push(post_with_comments[a].comments[b].message)
                            arr_comment_users.push(post_with_comments[a].comments[b].from.id)

                            if (b === 0){
                                //comments are sorted in reverse chronological order
                                //so first comment is the latest
                                //api doesnt allow searching from the last id but it does all you 
                                // to search comments made "since" a particular date/time
                                last_comment_date = post_with_comments[a].comments[b].created_time;
                            }
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
                                                            {return tone_analyzer.analyze_text(text);})),
                                            fb.get_demo_info(accounts[x].user_account.token_key,arr_comment_users)
                                            ]);
                        })
                        .then((tone_elements)=>{
                            //console.log(`Demo Info: ${JSON.stringify(tone_elements,null,2)}`)
                            if('sentiment' in tone_elements[0][0] && tone_elements[1][0].length > 0 ){
                                return Promise.all([Promise.all(tone_elements[0][0].sentiment.targets.map((target) =>{
                                            return  accounts[x].user_pages[y].createPost_Sentiment({keyword:target.text,
                                                post_id: post_with_comments[a].post,
                                                last_post_id: last_comment_date,
                                                tone_score:target.score
                                            })
                                        })),
                                        Promise.all(tone_elements[1][0].map((audience) =>{
                                                    return  accounts[x].user_pages[y].createPost_Tone({tone:audience.tone,
                                                        post_id: post_with_comments[a].post,
                                                        last_post_id: last_comment_date,
                                                        post:audience.text
                                                    })
                                                })),
                                        Promise.all(Object.keys(tone_elements[2]).map((key)=>{
                                            let country = key.substring(0,key.indexOf(','));
                                            let gender =  key.substring(key.indexOf(',')+ 1);
                                            return accounts[x].user_pages[y].createPost_Demographic({
                                                    post_id: post_with_comments[a].post,
                                                    country:country,
                                                    gender:gender,
                                                    count: tone_elements[2][key]
                                            })
                                        }))
                                ]);
                            }
                            else if ('sentiment' in tone_elements[0][0]){
                                return Promise.all([Promise.all(tone_elements[0][0].sentiment.targets.map((target) =>{
                                            return  accounts[x].user_pages[y].createPost_Sentiment({keyword:target.text,
                                                post_id: post_with_comments[a].post,
                                                last_post_id: last_comment_date,
                                                tone_score:target.score
                                            })
                                        })),
                                        Promise.all(Object.keys(tone_elements[2]).map((key)=>{
                                            let country = key.substring(0,key.indexOf(','));
                                            let gender =  key.substring(key.indexOf(',')+ 1);
                                            return accounts[x].user_pages[y].createPost_Demographic({
                                                    post_id: post_with_comments[a].post,
                                                    country:country,
                                                    gender:gender,
                                                    count: tone_elements[2][key]
                                            })
                                        }))
                                ]);
                            }
                            else if (tone_elements[1][0].length > 0){
                                console.log(JSON.stringify(tone_elements[2],null,2))
                                return Promise.all([
                                    Promise.all(tone_elements[1][0].map((audience) =>{
                                        return  accounts[x].user_pages[y].createPost_Tone({tone:audience.tone,
                                            post_id: post_with_comments[a].post,
                                            last_post_id: last_comment_date,
                                            post:audience.text
                                        })
                                    })),
                                    Promise.all(Object.keys(tone_elements[2]).map((key)=>{
                                        let country = key.substring(0,key.indexOf(','));
                                        let gender =  key.substring(key.indexOf(',')+ 1);
                                        return accounts[x].user_pages[y].createPost_Demographic({
                                                post_id: post_with_comments[a].post,
                                                country:country,
                                                gender:gender,
                                                count: tone_elements[2][key]
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

                    }
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