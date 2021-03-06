require('dotenv').config({path: '../../.env'});
const kue = require('kue');
const queue = kue.createQueue({redis:process.env.REDIS_URL});
const twitter_tones = require('../background_jobs/analyze_tweets');
const facebook_posts = require('../background_jobs/analyze_facebook_posts');
const facebook_mentions = require('../background_jobs/analyze_facebook_mentions');
const models = require('../../app/models/db');


queue.process('update_user_accounts',10,(job,done) => {
    console.log(`Processing ${job.data.user} from queue`);  
    let accounts = getAccountPages(job.data.user);
    done();
});

function getAccountPages(user_id){
    models.user.findById(user_id,{include:[{model:models.user_account}]})
    .then((user)=>{
        let user_account = Promise.all(user.User_Accounts.map((account)=>{
                return new Promise((resolve,reject)=>{
                    account.getPages()
                    .then((account_page)=>{
                            resolve({user_account:account,user_pages:account_page})
                    })
                    .catch((error)=>{
                        reject(error);
                    })
                }) 
        }));

        return user_account;
    })
    .then((user_account)=>{
        let twitter_user_accounts = user_account.filter((account)=>{
                                                        return account.user_account.account_type_id === 1;
                                                    });
        let facebook_user_accounts = user_account.filter((account)=>{
                                                        return account.user_account.account_type_id === 2;
                                                    });
        let instagram_user_accounts = user_account.filter((account)=>{
                                                        return account.user_account.account_type_id === 3;
                                                    });
        let youtube_user_accounts = user_account.filter((account)=>{
                                                        return account.user_account.account_type_id === 4;
                                                    });

        if (twitter_user_accounts.length > 0){
            twitter_tones.analyze_tweets(twitter_user_accounts);
        };

        if (facebook_user_accounts.length > 0){
            facebook_posts.analyze_fb(facebook_user_accounts);
            facebook_mentions.analyze_fb(facebook_user_accounts);
        };

        if (instagram_user_accounts.length > 0){
            //twitter_tones.analyze_tweets(twitter_user_accounts);
        };

        if (youtube_user_accounts.length > 0){
            //twitter_tones.analyze_tweets(twitter_user_accounts);
        };
    })
    .catch((error)=>{
        console.log(error);
    });
}