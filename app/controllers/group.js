require('dotenv').config();
const models = require('../models/db');

function updateGroup(req,res){
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
    req.user.createGroup({name: req.body.name,
                        type: req.body.type,
                        description: req.body.description,
                        categories: req.body.categories.split(',')
                        })
    .then((group)=>{
        return Promise.all([group],req.user.addGroups(group)) 
    })
    .then((result)=>{
        res.status(200).json({message:`${result[0].name} group successfully created`});
    })
    .catch((error)=>{
        console.log(error)
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
    req.user.getGroups({id:req.params.id})
    .then((group)=>{
        if (group.length <= 0){
            return Promise.reject("User is not a memeber of group")
        } 
        else{
            res.status(200).json(group)
        }
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    });
    /*models.group.findById(req.params.id)
    .then((group)=>{
        res.status(200).json(group)
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    });*/
}

function addGroupMemebr(req,res){

}

function getUserGroups(req,res){
    req.user.getGroups()
    .then((groups)=>{
        let formatted_groups = groups.map((group)=>{
                        return {name:group.name,type:group.type,description:group.description,categories:group.categories}
                        })
        res.status(200).json(formatted_groups)
    })
    .catch((error)=>{
        res.status(400).json({message:error})
    })
}

module.exports = {
    addGroup:addGroup,
    findGroup:findGroup,
    updateGroup:updateGroup,
    deleteGroup:deleteGroup,
    getUserGroups,getUserGroups
}