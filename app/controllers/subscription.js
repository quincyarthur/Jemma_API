const models = require('../models/db');

function getSubscription(req,res){
    req.user.getPlans()
    .then((subscription)=>{
        res.status(200).json(subscription);
    })
    .catch((error)=>{
        res.status(400).json({messge:error});
    });
}

function updateSubscription(req,res){
    /*Params: Plan_Name */
    models.plan.findOne({where:{plan_name:req.body.plan_name}})
    .then((plan)=>{
        return req.user.setPlans(plan,{through:{active: true}});
    })
    .then((subscription)=>{
        res.status(200).json(subscription);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

module.exports = {
    getSubscription:getSubscription,
    updateSubscription:updateSubscription
}