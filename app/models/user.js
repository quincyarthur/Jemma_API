'use strict';
const bcrypt = require('bcrypt-nodejs');
const models = require('../models/db');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', 
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email:{type: DataTypes.STRING,
            validate:{isEmail:true}
            },
      password: DataTypes.STRING,
      confirmed:{type: DataTypes.BOOLEAN,
                       defaultValue: false,
                       allowNull: false
                }
    },
    {scopes:{
      confirmed:{
        where:{confirmed: true}
      }
    }
  });

  User.beforeCreate((user, options)=> {
    //hash user's password before save
      return new Promise((resolve,reject)=>{
        bcrypt.genSalt(10,(error,salt)=>{
          if(error){
            reject(error);
          }
          else{
            resolve(salt);
          }
        })
      })
      .then((salt)=>{
        return new Promise((resolve,reject)=>{
          bcrypt.hash(user.password,salt,null,(error,hash)=>{
                resolve(hash);
            });
        })
      })
      .then((hashed_password)=>{
          user.password = hashed_password;
      })
      .catch(error =>{
        console.log(error);
      })
  });
  return User;
};