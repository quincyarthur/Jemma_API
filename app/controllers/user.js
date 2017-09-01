const models = require('../models/db');
const mail_queue = require('../mailer/send');

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
   destroy:destroy
}