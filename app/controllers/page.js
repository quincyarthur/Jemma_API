require('dotenv').config();
const models = require('../models/db');

function updateKeywords(req,res){
    /*
    Parameters
    id,keywords
     */
    models.page.find({where:{managed_page_id:req.params.id}})
    .then((page)=>{
        return page.update({
            keywords:req.body.keywords.split(',')
        })
    })
    .then((updated_page)=>{
        res.status(200).json({message:'successfully updated'});
    })
    .catch((error)=>{
        console.log(error);
        res.status(400).json({message:error});
    });
}

function findKeywords(req,res){
    models.page.find({where:{managed_page_id:req.params.id}})
    .then((page)=>{
        res.status(200).json(page.keywords)
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    });
}

module.exports = {
    findKeywords:findKeywords,
    updateKeywords:updateKeywords
}