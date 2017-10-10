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

function addAccount(req,res){
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
                            models.page.findOrCreate({
                                where:{managed_page_id:page.id},
                                defaults:{
                                    group_id: req.params.id,
                                    managed_page_id:page.id,
                                    keywords: []
                                }
                            })
                            .spread((page,created)=>{
                                return Promise.resolve(page);
                            })
                        }))
                        
            ])
        })
        .then((results)=>{
            let flattened = [].concat.apply([],results);
            return Promise.all(results[1].map((page)=>{flattened[0][0].addPage(page)
                   }))
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
    getPosts:getPosts
}