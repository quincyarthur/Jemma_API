require('dotenv').config();
const amqp = require('amqplib/callback_api');
const helper = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

//consume data passed to messgage queue
amqp.connect('amqp://syriskko:ZuwnTHFe0QCPxGjZa1w7ZaoQgB0kNYcX@crane.rmq.cloudamqp.com/syriskko', function (err, conn) { 
  if(err) {console.log(err)};

  conn.createChannel(function (err, ch) {
    if(err) {console.log(err)};
    let q = 'send_mail';
    ch.assertQueue(q, { durable: true });
    ch.consume(q, function (msg) {
      let mailOptions = {
          from: 'quincyarthur@gmail.com',
          to: JSON.parse(msg.content.toString() + '').email,
          text: JSON.parse(msg.content.toString() + '').msg,
      };
      //var obj = msg.content.toString();
      let message = JSON.parse(msg.content.toString() + '').msg;
      send_mail(message, mailOptions);
    }, { noAck: true });
  });
});

function send_mail(messageContent,mailOptions) {
    let fromEmail = new helper.Email(`${mailOptions.from}`);
    let toEmail = new helper.Email(`${mailOptions.to}`);
    let subject = `Hi! I'm Jemma`;
    let content = new helper.Content('text/plain',`${messageContent}`);
    let mail = new helper.Mail(fromEmail, subject, toEmail, content);
    
    let request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });
    
    sg.API(request, function (error, response) {
      if (error) {
        console.log('Error response received');
      }
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
}
