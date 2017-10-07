require('dotenv').config();
const kue = require('kue');
const queue = kue.createQueue({redis:process.env.REDIS_URL});

function sendMailToQueue(userDetails){
    let link = `${process.env.HOST}/api/v1/auth/verify/?id=${userDetails.id}`;
    let job = queue.create('email', {
        verify_link: link,
        body: `It's a pleasure to meet you ${userDetails.first_name} ${userDetails.last_name}, \n 
               Verify by clicking the following link and let's get started shall we?: \n ${link}`,
        to: userDetails.email,
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
      }).attempts(5).ttl(300000).removeOnComplete(true).save(function(err){ //ttl(milliseconds) kills job if a worker doesnt handle it in 5 minutes
        if(!err) {
          console.log(`Sending job to Mail Queue`);
        }
        else{
          console.log(`Error sending job to Mail Queue`);
        }
      });
}

function sendUserAccountToQueue(user_id){
    let job = queue.create('update_user_accounts',{
        user: user_id
      }).attempts(5).ttl(300000).removeOnComplete(true).save(function(err){ //ttl(milliseconds) kills job if a worker doesnt handle it in 5 minutes
        if(!err){ 
          console.log(`Sending job to User Account Queue`);
        }
        else{
          console.log(`Error Sending job to User Account Queue`);
        }
      });
}

module.exports = {
    sendMailToQueue:sendMailToQueue,
    sendUserAccountToQueue: sendUserAccountToQueue
}