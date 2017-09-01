const twitter =  require('../services/twitter');
const models = require('../models/db');
const watson_language = require('../services/language_analyzer');
const language_analyzer = new watson_language.LanguageAnalyzer();

function getProfile(req,res){
    req.user.getAccount_Types({where:{description:'Twitter'}})
    .then((profile_info)=>{
        let profiles = Promise.all(profile_info.map((account)=>{
                                return twitter.getUserProfileInfo(account.User_Account.account_id,account.User_Account.token_key,account.User_Account.token_secret);
                       }));
        return profiles;
    })
    .then((profile)=>{
        console.log(profile);
        let profile_details = profile[0].map((profile)=>{JSON.stringify({profile_id:profile.id,handle:profile.screen_name,
                                                      num_tweets:profile.statuses_count,followers:profile.followers_count,
                                                      profile_image:profile.profile_image_url}
                                                      )});
        res.status(200).json(JSON.stringify(profile_details));
    })
    .catch((error)=>{
        console.log(error);
        res.status(400).json({message:error});
    })
}

function getAudienceTone(req,res){
        twitter.get_tweets()
        .then((array)=>{
            return language_analyzer.load_text(array);
        })
        .then((batch_text)=>{
            let tone_elements = Promise.all(batch_text.map((text) => 
                                            {return language_analyzer.analyze_text(text);}));
            return tone_elements;
        })
        .then((tone_elements)=>{
            res.status(200).json(tone_elements);
        })
        .catch((error)=>{
            res.status(400).json({message:error});
        });
}

function addAccount(req,res){
    /*
    Parameters:
    token_key,token_secret,group_id
    */
    twitter.verifyCredentials(req.body.token_key,req.body.token_secret)
    .then((user_account_info)=>{
        return Promise.all([
           models.user_account.find({
                where:{user_id:req.user.id,account_id:user_account_info.id_str}
            }),
           Promise.resolve(models.account_type.findOne({where:{description:'Twitter'}})),
           Promise.resolve(user_account_info.id_str)
        ]);
    })
    .then((user_account)=>{
        if(!user_account[0]){
            return Promise.all([
                Promise.resolve(req.user.addAccount_Type(user_account[1], 
                    {through:{token_key:req.body.token_key,
                              token_secret:req.body.token_secret,
                              account_id:user_account[2]
                             }
                    }
                )),
                models.page.findOrCreate({
                    where:{managed_page_id:user_account[2]},
                    defaults:{
                        group_id: req.body.group_id,
                        managed_page_id:user_account[2],
                        keywords: JSON.stringify(req.body.keywords) || JSON.stringify([''])
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
        return results[0][0][0].addPage(results[1]);
    })
    .then((account_page)=>{
        res.status(200).json({message:'Twitter Account successfully added'})
    })
   .catch((error)=>{
       console.log(error)
        res.status(400).json({message:error});
   });
}

module.exports = {
    addAccount:addAccount,
    getAudienceTone:getAudienceTone,
    getProfile:getProfile
}