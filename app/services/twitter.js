require('dotenv').config();
const twitter_api = require('twitter');
var client = new twitter_api({
                consumer_key: process.env.TWITTER_CONSUMER_KEY,
                consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
                access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
                access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
             });

class Twitter {
    constructor(){
        this.pages = 0;
        this.max_id_str = '';
        this.tweet_array = [];
        this.get_tweets =  (resolve,reject,max_id,handle,name) => {
            //account for looping handle and name (done)
            // add functionality where the orginal max_str_id is saved in db so future searches know where to stop (done)
            let path = 'search/tweets';
            let params = {
                q:'',
                result_type: 'recent',
                count: 100, //maximum
                since_id: max_id || '',
                lang: 'en',
                tweet_mode: 'extended'
            };
            let str_max_id = '';
            //let tweet_array = [];
            let today = new Date();
            let dd = today.getDate();
            let mm = today.getMonth() + 1; //January is 0
            let yyyy = today.getFullYear();
            today = yyyy + '-'+ mm + '-' + dd;
        
            params.q = `(@${handle} since:${today} OR #${handle} since:${today} OR ${name} since:${today}) 
                        AND (source:"Twitter for Android" OR source:"Twitter for iPhone" OR source:tweetdeck OR source:web)
                        AND (-filter:retweets) AND (-filter:replies)`
        
            //return new Promise((resolve,reject) =>{
                    client.get(path,params)
                    .then((tweets)=>{
                        console.log(`Page: ${this.pages}, #Tweets: ${tweets.statuses.length}, Since Id: ${tweets.search_metadata.since_id_str}`)
                        for(let x = 0;x < tweets.statuses.length;x++){
                            this.tweet_array.push(tweets.statuses[x].full_text);
                        };

                        this.pages++;
                                       
                       if (this.pages > 100 || tweets.statuses.length < 100) {
                           let results = {max_id:tweets.search_metadata.max_id_str,
                                          array:this.tweet_array
                                         }
                            resolve(results);
                        }
                        else{
                            params.since_id_str = tweets.search_metadata.max_id_str
                            this.get_tweets(resolve,reject,params.since_id_str,handle,name); //recursive implementation
                        }
                    })
                    .catch((error)=>{
                        console.log(error)
                        reject(error);
                    });
            //});
        }
    };
};

Twitter.prototype.verifyCredentials = (access_token_key,access_token_secret) => {
    client.access_token_key = access_token_key;
    client.access_token_secret = access_token_secret;
    let path = 'account/verify_credentials';
    let params = {include_entities:false,
                  include_email:false,
                  skip_status:true}

    return new Promise((resolve,reject)=>{
        client.get(path,params)
        .then((user_account_info)=>{
            resolve(user_account_info);
        })
        .catch((error)=>{
            reject(error);
        });
    });
}

Twitter.prototype.getUserProfileInfo = (user_id,token_key,token_secret) =>{
    client.access_token_key = token_key;
    client.access_token_secret = token_secret;
    let path = 'users/lookup';
    let params = {user_id:user_id};

    return new Promise((resolve,reject)=>{
        client.get(path,params)
        .then((user_account_info)=>{
            resolve(user_account_info);
        })
        .catch((error)=>{
            reject(error);
        });
    });
}

module.exports = {
   Twitter:Twitter
};