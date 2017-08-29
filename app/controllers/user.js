require('dotenv').config();
const models = require('../models/db');
const mail_queue = require('../mailer/send');
const twitter =  require('../services/twitter')

function addTwitterAccounts(req,res){
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

function create(req,res){
    models.user.find(
        {where:{email:req.body.email}}
    )
    .then((user) => {
        if (user){
          return res.status(400).json({'message':'user already exists'});            
        }
        else{
          return models.user.create({
               first_name:req.body.first_name.toString().toLowerCase(),
               last_name:req.body.last_name.toString().toLowerCase(),
               email:req.body.email.toString().toLowerCase(),
               password:req.body.password
          })
        }
    })
    .then((user) => {
          mail_queue.send_to_queue(user);
          res.status(201).json(user);
    })
    .catch((error) => {
        res.status(400).json(error);
    });  
}

function find(req,res){
    return models.user.findById(req.params.id)
    .then((user) => {
        res.status(201).json(user)
    })
    .catch((error) => {
        res.status(400).json(error)
    });
}

function update(req,res){
    res.status(200).json('I dont do nothing yet..Soon tho');
}

function destroy(req,res){
   models.user.findById(req.params.id)
   .then((user) =>{
         user.destroy();
         return res.status(201).json({message:'successfully deleted'})
    })
   .catch((error) => {
        res.status(400).json(error);
   })
}

module.exports = {
   create:create,
   find:find,
   update:update,
   destroy:destroy,
   addTwitterAccounts:addTwitterAccounts
}