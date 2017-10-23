const twitter_service =  require('../services/twitter');
const watson_language = require('../services/language_analyzer');
const models = require('../models/db');

function getProfile(req,res){
    req.user.getUser_Accounts({where:{account_id:req.params.account_id}})
    .then((profile_info)=>{
        if (profile_info.length <= 0){
            return Promise.all(profile_info.map((account)=>{
                                console.log(JSON.stringify(account,null,2))
                                let twitter = new twitter_service.Twitter(account.token_key,account.token_secret);
                                return twitter.getUserProfileInfo(req.params.account_id);
               }));   
        }
        else{
            return Promise.reject('Twitter Account already tied to user');
        }
    })
    .then((profile)=>{
        console.log(JSON.stringify(profile,null,2))
        let profile_details = profile[0].map((profile)=>{return {profile_id:profile.id,handle:profile.screen_name,
                                                      num_tweets:profile.statuses_count,followers:profile.followers_count,
                                                      profile_image:profile.profile_image_url}
                                                      });
        res.status(200).json(profile_details);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

function addAccount_Old(req,res){
    /*
    Parameters:
    token_key,token_secret,group_id
    */
    let twitter = new twitter_service.Twitter(req.body.token_key,req.body.token_secret);
    twitter.verifyCredentials()
    .then((user_account_info)=>{
        return Promise.all([
           models.user_account.find({
                where:{user_id:req.user.id,token_key:req.body.token_key,token_secret:req.body.token_secret}
            }),
           models.account_type.findOne({where:{description:'Twitter'}}),
           Promise.resolve(user_account_info.id_str)
        ]);
    })
    .then((user_account)=>{
        if(!user_account[0]){
           return Promise.all([
                req.user.addAccount_Type(user_account[1], 
                    {through:{token_key:req.body.token_key,
                              token_secret:req.body.token_secret
                             }
                    }
                ),
                models.page.findOrCreate({
                    where:{managed_page_id:user_account[2]},
                    defaults:{
                        group_id: req.params.id,
                        managed_page_id:user_account[2],
                        keywords: []
                    }
                })
                .spread((page,created)=>{
                    return Promise.resolve(page);
                })
            ]); 
        }
        else{
            return res.status(400).json({message:'Twitter account already tied to user'});
        }
    })
    .then((results)=>{
        let flattened = [].concat.apply([],results);
        return flattened[0][0].addPage(results[1]);
    })
    .then((account_page)=>{
        res.status(200).json({message:'Twitter Account successfully added'})
    })
   .catch((error)=>{
       console.log(error)
        res.status(400).json({message:error});
   });
}

function addAccount(req,res){
    return Promise.all([models.account_type.findOne({where:{description:'Twitter'}}),
                        models.user_account.findOne({where:{account_id:req.params.account_id}})])
    .then((results)=>{
        if (!results[1]){
            return Promise.all([req.user.createUser_Account({
                                            account_id: req.params.account_id,
                                            token_key:req.body.token_key,
                                            token_secret:req.body.token_secret,
                                            account_type_id:results[0].id}),
                                        models.page.findOrCreate({
                                            where:{managed_page_id:req.params.account_id},
                                            defaults:{
                                                group_id: req.params.group_id,
                                                managed_page_id:req.params.account_id,
                                                keywords: []
                                            }
                                        })
                                        .spread((page,created)=>{
                                            return Promise.resolve(page);
                                        })         
                            ])
        }
        else{
            return Promise.reject('Account already tied to user')
        }     
    })
    .then((accounts)=>{
        let flattened = [].concat.apply([],accounts);
        console.log(JSON.stringify(flattened,null,2))
        return flattened[0].addPages(accounts[1])
    })
    .then((account_page)=>{
        res.status(200).json({message:'Twitter Account successfully added'})
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    })
}

function getMentionTones(req,res){
    models.page.find({where:{managed_page_id:req.params.page_id}})
    .then((page)=>{
        return models.sequelize.query(`SELECT tone,string_agg(array_to_string(post,';'),';') as posts
                                        FROM "Mention_Tones" 
                                        where page_id = :page_id
                                        and created_at between :from and :to
                                        GROUP BY page_id,tone`,
                                {replacements:{page_id:page.id,from:new Date(`${req.body.from} 00:00:00`),to:new Date(`${req.body.to} 23:59:59`)},
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
    models.page.find({where:{managed_page_id:req.params.page_id}})
    .then((page)=>{
        let language_analyzer = new watson_language.LanguageAnalyzer();
        let keywords = language_analyzer.params.features.sentiment.targets.concat(page.keywords);
        return models.sequelize.query(`SELECT keyword,AVG(tone_score) score
                                        FROM "Keyword_Sentiments" 
                                        WHERE page_id = :page_id and keyword in (:keyword)
                                        AND created_at::date between :from and :to
                                        GROUP BY keyword`,
                        {replacements:{page_id:page.id,keyword:keywords,from:new Date(`${req.body.from} 00:00:00`),to:new Date(`${req.body.to} 23:59:59`)},
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

module.exports = {
    addAccount:addAccount,
    getProfile:getProfile,
    getMentionSentiments:getMentionSentiments,
    getMentionTones:getMentionTones
}