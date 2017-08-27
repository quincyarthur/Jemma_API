require('dotenv').config();
const models = require('../models/db');
const mail_queue = require('../mailer/send');
const twitter =  require('../services/twitter')

function addTwitterAccounts(req,res){
    twitter.verifyCredentials(req.body.token_key,req.body.token_secret)
    .then((user_account_info)=>{
        return Promise.all(
           models.user_account.find({
                where:{user_id:req.user.id,account_id:user_account_info.id_str}
            }),
           models.account_type.findOne({where:{description:'Twitter'}})
        );
    })
    .then((user_account)=>{
        if (!user_account){
            res.json('empty')
        }
        else{
            res.json('not')
        }
        //res.json(user_account);
        /*if(!user_account){
            return req.user.createUserAccount({
                account_id:user_account_info.id_str,
                token_key:req.body.token_key,
                token_secret:req.body.token_secrey
                //account_type_id: 
            });
        }*/
    })
   .catch((error)=>{
        res.status(400).json({message:error});
   });
    /*models.user.findById(req.params.id)
    .then((user)=>{
        user.createUserAccount({
            account_id: req.body.account_id,
            account_type_id: req.body.account_type_id,
            access_key: req.body.access_token,
            access_secret: req.body.access_secret
        })
    })*/
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