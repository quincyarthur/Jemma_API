require('dotenv').config({path: '../../.env'});
const cron = require('node-cron');
const models = require('../models/db');
const user_queue = require('../background_jobs/send_kue');

//task will run once every minute
let task = cron.schedule('* * * * *', ()=>{
    let today = new Date();
    models.user.findAll({include:[{model:models.plan}]})
    .then((user)=>{
        for (let x = 0; x < user.length; x++){
            if (!user[x].last_updated){
                user_queue.sendUserAccountToQueue(user[x].id);
            }
            else if((today.getTime() - user[x].last_updated.getTime()) >= ((user[x].Plans[0].account_update_interval * 60) * 1000)){
                user_queue.sendUserAccountToQueue(user[x].id);
            }
        }
    })
    .catch((error)=>{
        console.log(error);
    })
});
 
task.start();
