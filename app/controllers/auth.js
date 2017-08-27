require('dotenv').config();
const models = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const twitter = require('../services/twitter');

function verifyAccount(req,res){
    models.user.find({where:{id:req.query.id}})
    .then((user)=>{
        return user.update({confirmed:true});
    })
    .then((updated_user)=>{
        res.status(200).json({message:'success',user:updated_user});
    })
    .catch((error) => {
        res.send(error);
    });
}

function authLocal(req,res){
    models.user.find(
        {where:{email:req.body.email.toString().toLowerCase()}
    })
    .then((user) =>{
        if(!user){
           res.status(400).json({'message':'email not found'});
        }
        else{
            bcrypt.compare(req.body.password,user.password,(error,isMatch)=>{
             if (error || !isMatch){
                 res.status(400).json({'message':'Incorrect Password'});
             }
             else if(isMatch){
                let token = jwt.sign({user:{id:user.id,confirmed:user.confirmed}},process.env.JWT_SECRET,
                                     {expiresIn: "2 days"});
                res.status(200).json({user:user,jwtToken:`JWT ${token}`});
             }
            });
        }
    })
    .catch((error)=>{
        res.status(400).json({'message':error});
    });
}

module.exports = {
    authLocal: authLocal,
    verifyAccount: verifyAccount
}