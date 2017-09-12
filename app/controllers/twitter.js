const twitter_service =  require('../services/twitter');
const twitter = new twitter_service.Twitter();
const models = require('../models/db');

function getProfile(req,res){
    /*returns array in the event user has multiple twitter accounts */
    req.user.getAccount_Types({where:{description:'Twitter'}})
    .then((profile_info)=>{
        if (profile_info.length === 0){
            return Promise.reject('No Twitter accounts found for user');
        }
        else{
            let profiles = Promise.all(profile_info.map((account)=>{
                                       return twitter.getUserProfileInfo(account.User_Account.account_id,
                                                                         account.User_Account.token_key,account.User_Account.token_secret);
                                      }));
            return profiles;
        }
    })
    .then((profile)=>{
        let profile_details = profile[0].map((profile)=>{return {profile_id:profile.id,handle:profile.screen_name,
                                                      num_tweets:profile.statuses_count,followers:profile.followers_count,
                                                      profile_image:profile.profile_image_url}
                                                      });
        res.status(200).json(profile_details);
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    });
}

function getAudienceTone(req,res){
    /*Params: Profile_id*/
    models.user_account.findOne({where:{account_id:req.query.profile_id},
                                 include:[{model:models.account_type,where:{description:'Twitter'}}
                                       ]
                               })
    .then((profile)=>{
        if (!profile){
            return Promise.reject('Not a valid Twitter Account');
        }else{
            //go to db and search all tone records and get averages per category
            res.send("Add Functionality to retrieve averages from db");
        }
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
           models.account_type.findOne({where:{description:'Twitter'}}),
           Promise.resolve(user_account_info.id_str)
        ]);
    })
    .then((user_account)=>{
        if(!user_account[0]){
            return Promise.all([
                req.user.addAccount_Type(user_account[1], 
                    {through:{token_key:req.body.token_key,
                              token_secret:req.body.token_secret,
                              account_id:user_account[2]
                             }
                    }
                ),
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
        console.log(results)
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