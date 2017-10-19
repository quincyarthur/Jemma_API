const fb_service = require('../services/facebook');
const facebook = new fb_service.Facebook();
const models = require('../models/db');

//test pagination
function getPosts(req,res){
    return facebook.get_posts(req.body.temp_user_access_token)
    .then((posts)=>{
        res.status(200).json(posts);
    })
    .catch((error)=>{
        res.status(400).json({message:error})
    })
}

function getUserAccountInfo(req,res){
    //get all facebook accounts tied to user
    req.user.getAccount_Types({account_type_id:2})
    .then((facebook_accounts)=>{
        for(let x = 0; x < facebook_accounts.length; x++){
            //equivalent of 'me/accounts' ensures user only sees pages they continue to admin
            facebook.get_extended_page_access_token(facebook_accounts[x].User_Account.token_key)
            .then((authorized_pages)=>{
                facebook_accounts[x].User_Account.getPages()
                .then((pages)=>{
                    let user_pages = pages.filter((page)=>{return authorized_pages.map((auth)=>{return auth.id}).indexOf(page.managed_page_id) >= 0 });
                    return user_pages;
                    //res.json(user_pages)
                })
                .then((user_pages)=>{
                  return Promise.all(user_pages.map((page)=>{
                        return facebook.get_page_info(facebook_accounts[x].User_Account.token_key,page.managed_page_id);
                    }))
                })
                .then((page_info)=>{
                    let page = Promise.all(page_info.map((page)=>{
                        return facebook.get_page_posts(facebook_accounts[x].User_Account.token_key,page.id)
                        .then((posts)=>{
                            let user_posts = posts.filter((post)=> {return 'message' in post})
                            return {name:page.name,num_fans:page.fan_count,picture:page.picture.data.url,posts:user_posts}
                        })
                        .catch((error)=>{
                            console.log(error);
                        })
                    }))
                 return page;
                })
                .then((page_details)=>{
                    res.status(200).json(page_details);
                })
                .catch((error)=>{
                    console.log(error)
                    return Promise.reject(error);
                })
            })
            .catch((error)=>{
                res.status(400).json({message:error});
                console.log(error)
            })          
        }
        
    })
}

function getPostSentiment(req,res){
    models.page.findById(req.params.page_id)
    .then((page)=>{
        let language_analyzer = new watson_language.LanguageAnalyzer();
        let keywords = language_analyzer.params.features.sentiment.targets.concat(page.keywords);
        return models.sequelize.query(`SELECT keyword,AVG(tone_score) score
                                        FROM "Post_Sentiments" 
                                        WHERE post_id = :post_id and keyword in (:keyword)
                                        GROUP BY keyword`,
        {replacements:{post_id:request.params.post_id,keyword:keywords},
        type: models.sequelize.QueryTypes.SELECT})
    })     
    .then((sentiments)=>{
        res.status(200).json(sentiments);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

function getPostTones(req,res){
    return models.sequelize.query(`SELECT tone,string_agg(array_to_string(post,';'),';') as posts
                                    FROM "Post_Tones" 
                                    where post_id = :post_id
                                    GROUP BY post_id,tone`,
                {replacements:{post_id:req.params.post_id},
                type: models.sequelize.QueryTypes.SELECT})  
    .then((tones)=>{
        res.status(200).json(tones);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

function getPostDemographics(req,res){
    return models.sequelize.query(`SELECT country,gender,count(gender) count
                                    FROM "Post_Demographics" 
                                    WHERE post_id = :post_id
                                    GROUP BY country,gender`,
    {replacements:{post_id:request.params.post_id,keyword:keywords},
    type: models.sequelize.QueryTypes.SELECT})  
    .then((demographics)=>{
        res.status(200).json(demographics);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

function getMentionTones(req,res){
    models.page.findById(req.params.page_id)
    .then((page)=>{
        return models.sequelize.query(`SELECT tone,string_agg(array_to_string(post,';'),';') as posts
                                        FROM "Mention_Tones" 
                                        where page_id = :page_id
                                        and created_at between :from and :to
                                        GROUP BY page_id,tone`,
                                {replacements:{page_id:page.id,from:req.body.from,to:req.body.to},
                                type: models.sequelize.QueryTypes.SELECT})
    })     
    .then((sentiments)=>{
        res.status(200).json(sentiments);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

function getMentionSentiments(req,res){
    models.page.findById(req.params.page_id)
    .then((page)=>{
        let language_analyzer = new watson_language.LanguageAnalyzer();
        let keywords = language_analyzer.params.features.sentiment.targets.concat(page.keywords);
        return models.sequelize.query(`SELECT keyword,AVG(tone_score) score
                                        FROM "Keyword_Sentiments" 
                                        WHERE page_id = :page_id and keyword in (:keyword)
                                        AND created_at between :from and :to
                                        GROUP BY keyword`,
                        {replacements:{page_id:page.id,keyword:keywords,from:req.body.from,to:req.body.to},
                        type: models.sequelize.QueryTypes.SELECT})
    })     
    .then((sentiments)=>{
        res.status(200).json(sentiments);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

function addAccount(req,res){
    return Promise.all([models.account_type.findOne({where:{description:'Facebook'}}),
                        facebook.extend_user_access_token(req.body.temp_user_access_token)
                       ])
    .then((results)=>{
            let arr_pages = req.body.pages.split(',');
            return Promise.all([req.user.addAccount_Types(results[0],{through:{token_key:results[1]}}),
                                Promise.all(arr_pages.map((page)=>{
                                    return new Promise((resolve,reject)=>{
                                        models.page.findOrCreate({
                                            where:{managed_page_id:page.id},
                                            defaults:{
                                                group_id: req.params.id,
                                                managed_page_id:page.id,
                                                keywords: []
                                            }
                                        })
                                        .spread((page,created)=>{
                                            resolve(page);
                                        })
                                    }) 
                                }))           
                            ])
    })
    .then((accounts)=>{
        let flattened = [].concat.apply([],accounts);
        return flattened[0][0].addPages(accounts[1])
    })
    .then((account_page)=>{
        res.status(200).json({message:'Facebook Account successfully added'})
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    })
}

function addAccount_Previous_Version(req,res){
    return facebook.extend_user_access_token(req.body.temp_user_access_token)
    .then((extended_user_access_token)=>{
        return Promise.all([facebook.get_extended_page_access_token(extended_user_access_token),extended_user_access_token]);
    })
    .then((pages)=>{
        return Promise.all([models.account_type.findOne({where:{description:'Facebook'}}),
                           models.user_account.find({where:{user_id:req.user.id,token_key:pages[1]}})
                          ])
        .then((account)=>{

            if(account[1]){
                return Promise.reject('User is already tied to Facebook account');
            }

            return Promise.all([
                        req.user.addAccount_Types(account[0],{through:{token_key:pages[1]}
                                                }),
                        Promise.all(pages[0].map((page)=>{
                            return new Promise((resolve,reject)=>{
                                models.page.findOrCreate({
                                    where:{managed_page_id:page.id},
                                    defaults:{
                                        group_id: req.params.id,
                                        managed_page_id:page.id,
                                        keywords: []
                                    }
                                })
                                .spread((page,created)=>{
                                    resolve(page);
                                })
                            }) 
                        }))           
            ])
        })
        .then((results)=>{
            let flattened = [].concat.apply([],results);
            return flattened[0][0].addPages(results[1])
        })
        .then((account_page)=>{
            res.status(200).json({message:'Facebook Account successfully added'})
        })
        .catch((error)=>{
            console.log(error)
            res.status(400).json({message:error});
        })

    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    })

}

module.exports = {
    addAccount:addAccount,
    getPosts:getPosts,
    getUserAccountInfo:getUserAccountInfo,
    getPostSentiment:getPostSentiment,
    getPostTones:getPostTones,
    getMentionSentiments:getMentionSentiments,
    getMentionTones:getMentionTones,
    getPostDemographics:getPostDemographics
}