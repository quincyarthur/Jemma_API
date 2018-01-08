require('dotenv').config();
const models = require('../models/db');
const mail_queue = require('../background_jobs/send_kue');

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
                        categories: req.body.categories
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
    req.user.getGroups({where:{id:req.params.id}})
    .then((group_owner)=>{
        if( typeof group_owner !== undefined && group_owner.length > 0){
            return models.group.destroy({where:{id:group_owner[0].id}})
        }
        else{
            return Promise.reject("User is not the owner of group requested");
        }
    })
    .then((destroyed_group)=>{
        res.status(200).json({message:'Group Successfully deleted'})
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    })
}

function findGroup(req,res){
    req.user.getGroups({where:{id:req.params.id}})
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
}

function inviteGroupMember(req,res){
    req.user.getGroups({where:{id:req.params.group_id}})
    .then((group_owner)=>{
        if( typeof group_owner !== undefined && group_owner.length > 0){
            return Promise.all([models.user.findById(req.params.user_id),
                models.group.findById(req.params.group_id)
              ])
        }
        else{
            //res.status(200).json({message:"User is not the owner of group requested"});
            return Promise.reject("User is not the owner of group requested");
        }
    })
    .then((results)=>{
        console.log(JSON.stringify(results))
        mail_queue.sendGroupMemberInvite(results)
        res.status(200).json({message:'Invite sent!'})
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error})
    })
}

function addGroupMember(req,res){
    return Promise.all([models.user.findById(req.query.user_id),
                       models.group.findById(req.query.group_id)])
    .then((results)=>{
        results[0].addGroups(results[1])
    })
    .then((group_member)=>{
        res.status(200).json({message:"User successfully added to group"})
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error})
    })
}

function getUserGroups(req,res){
    req.user.getGroups()
    .then((groups)=>{
        let formatted_groups = groups.map((group)=>{
                        return {id:group.id,name:group.name,type:group.type,description:group.description,categories:group.categories}
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
    getUserGroups,getUserGroups,
    inviteGroupMember:inviteGroupMember,
    addGroupMember:addGroupMember
}