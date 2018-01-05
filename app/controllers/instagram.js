const instagram_service =  require('../services/instagram');
const watson_language = require('../services/language_analyzer');
const models = require('../models/db');



function addAccount(req,res){
    instagram_service.get_account_info(req.params.access_token)
    .then((user_profile)=>{
        return Promise.all([models.account_type.findOne({where:{description:'Instagram'}}),
                            models.user_account.findOne({where:{account_id:user_profile.data.id}}),
                            Promise.resolve(user_profile.data)
                          ])
    })
    .then((results)=>{
       // console.log(JSON.stringify(results[1],null,2));
        if (!results[1]){
            return Promise.all([req.user.createUser_Account({
                                            account_id: results[2].id,
                                            token_key:req.params.access_token,
                                            token_secret:null,
                                            account_type_id:results[0].id}),
                                        models.page.findOrCreate({
                                            where:{managed_page_id:results[2].id},
                                            defaults:{
                                                group_id: req.params.group_id,
                                                managed_page_id:results[2].id,
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
        res.status(200).json({message:'Instagram Account successfully added'})
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    })
}

function getProfile(req,res){
    req.user.getUser_Accounts({where:{account_id:req.params.account_id}})
    .then((profile_info)=>{
        if (profile_info.length > 0){
            return Promise.all(profile_info.map((account)=>{
                                console.log(JSON.stringify(account,null,2))
                                //let instagram = new instagram_service.Instagram(account.token_key);
                                return instagram_service.get_account_info(account.token_key);
               }));   
        }
        else{
            return Promise.reject('Instagram Account does not exist');
        }
    })
    .then((profile)=>{
        console.log(JSON.stringify(profile,null,2))
        let profile_details = profile[0].map((profile)=>{return {profile_id:profile.id,handle:profile.full_name,
                                                      num_posts:profile.counts.media,followers:profile.counts.followed_by,
                                                      num_followers:profile.counts.follows, profile_image:profile.profile_picture}
                                                      });
        res.status(200).json(profile_details);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

function getPosts(req,res){
    req.user.getUser_Accounts({where:{account_id:req.params.account_id}})
    .then((user_account)=>{
        if (user_account.length > 0){
            return Promise.all(user_account.map((account)=>{
                                console.log(JSON.stringify(account,null,2))
                                return instagram_service.get_posts(account.token_key);
               }));   
        }
        else{
            return Promise.reject('Instagram Account does not exist');
        }
    })
    .then((user_posts)=>{
        res.status(200).json({posts:[].concat.apply([],user_posts)});
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    })
}

function getComments(req,res){
    req.user.getUser_Accounts({where:{account_id:req.params.account_id}})
    .then((user_account)=>{
        if (user_account.length > 0){
            return Promise.all(user_account.map((account)=>{
                                console.log(JSON.stringify(account,null,2))
                                return instagram_service.get_post_comments(account.token_key,req.params.post_id);
               }));   
        }
        else{
            return Promise.reject('Instagram Account does not exist');
        }
    })
    .then((post_comments)=>{
        res.status(200).json({comments:[].concat.apply([],post_comments)});
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    })
}

module.exports = {
    addAccount:addAccount,
    getProfile:getProfile,
    getPosts:getPosts,
    getComments:getComments
}