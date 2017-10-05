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
        name: req.body.name
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

module.exports = {
    addGroup:addGroup,
    findGroup:findGroup,
    updateGroup:updateGroup,
    deleteGroup:deleteGroup
}