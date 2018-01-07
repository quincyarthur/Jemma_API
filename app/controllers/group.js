require('dotenv').config();
const models = require('../models/db');

function updateGroup(req,res){
    /*
    Parameters
    id,name
     */
    models.group.findById(req.params.id)
    .then((group)=>{
        return group.update({
            name:req.body.name
        })
    })
    .then((updated_group)=>{
        res.status(200).json({message:'successfully updated'});
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    });
}

function addGroup(req,res){
    models.group.create({
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        categories: req.body.categories.split(',')
    })
    .then((group)=>{
        res.status(200).json({message:`${group.name} group successfully created`});
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    });
}

function deleteGroup(req,res){
    models.group.findById(req.params.id)
    .then((group)=>{
        group.destroy();
        res.status(200).json({message:'group successfully destroyed'});
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    });
}

function findGroup(req,res){
    models.group.findById(req.params.id)
    .then((group)=>{
        res.status(200).json(group)
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    });
}

function getUserGroups(req,res){
    req.user.getUser_Accounts()
    .then((user_account)=>{
        let user_groups = Promise.all(user_account.map((account)=>{
                            return new Promise((resolve,reject)=>{
                                account.getPages()
                                .then((account_page)=>{
                                    resolve({user_groups:account_page.map((account)=>{return account.group_id})})
                                })
                                .catch((error)=>{
                                    reject(error);
                                })
                            })
            }));
    
        return user_groups;
    })
    .then((user_groups)=>{
        let distinct_groups = [...new Set(user_groups[0].user_groups)];
        let groups = Promise.all(distinct_groups.map((id)=>{
                                   return new Promise((resolve,reject)=>{
                                            models.group.findById(id)
                                            .then((group)=>{
                                                resolve(group)
                                            })
                                            .catch((error)=>{
                                                reject(error)
                                            })
                                   })
                                }))
        return groups
    })
    .then((groups)=>{
        res.status(200).json(groups);
    })
    .catch((error)=>{
        console.log(`Error: ${JSON.stringify(error)}`)
        res.status(400).json({message:error});
    })
}

module.exports = {
    addGroup:addGroup,
    findGroup:findGroup,
    updateGroup:updateGroup,
    deleteGroup:deleteGroup,
    getUserGroups,getUserGroups
}