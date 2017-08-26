require('dotenv').config();
module.exports.send_to_queue = function (userDetails) {
    const amqp = require('amqplib/callback_api');

    amqp.connect('amqp://syriskko:ZuwnTHFe0QCPxGjZa1w7ZaoQgB0kNYcX@crane.rmq.cloudamqp.com/syriskko', function (err, conn) {
        if(err) {console.log(err)};
        conn.createChannel(function (err, ch) {
          if(err) {console.log(err)};
            let q = 'send_mail';
            let msgObj = {};
            msgObj.link = `${process.env.HOST}/api/v1/auth/verify/?id=${userDetails.id}`;
            let msg = `It's a pleasure to meet you ${userDetails.first_name} ${userDetails.last_name}, \n 
                       Verify by clicking the following link and let's get started shall we?: \n ${msgObj.link}`;
            msgObj.msg = msg;
            msgObj.email = userDetails.email;
            msgObj.first_name = userDetails.first_name;
            msgObj.last_name = userDetails.last_name;
      
            ch.assertQueue(q, { durable: true });
            ch.sendToQueue(q, new Buffer(JSON.stringify(msgObj) + ''),{persistent: true});
          });
          setTimeout(function () { conn.close(); }, 3500);
    });
  }