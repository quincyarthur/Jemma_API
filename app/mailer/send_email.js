const kue = require('kue');
const queue = kue.createQueue({redis:process.env.REDIS_URL});
const helper = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
queue.process('email',(job,done) => {  
    let mailOptions = {
        from: 'quincyarthur@gmail.com',
        to: job.data.to,
        text: job.data.body,
    };
    send_mail(mailOptions);
    done();
});

queue.watchStuckJobs(1000);

function send_mail(mailOptions) {
    let fromEmail = new helper.Email(`${mailOptions.from}`);
    let toEmail = new helper.Email(`${mailOptions.to}`);
    let subject = `Hi! I'm Jemma`;
    let content = new helper.Content('text/plain',`${mailOptions.text}`);
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
