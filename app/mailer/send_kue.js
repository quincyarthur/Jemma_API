require('dotenv').config();
const kue = require('kue');
const queue = kue.createQueue();

function sendToQueue(userDetails){
    let link = `${process.env.HOST}/api/v1/auth/verify/?id=${userDetails.id}`;
    let job = queue.create('email', {
        verify_link: link,
        body: `It's a pleasure to meet you ${userDetails.first_name} ${userDetails.last_name}, \n 
               Verify by clicking the following link and let's get started shall we?: \n ${link}`,
        to: userDetails.email,
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
      }).attempts(5).ttl(300000).removeOnComplete(true).save(function(err){ //ttl(milliseconds) kills job if a worker doesnt handle it in 5 minutes
        if(!err) console.log( job.id );
      });
}

module.exports = {
    sendToQueue:sendToQueue
}