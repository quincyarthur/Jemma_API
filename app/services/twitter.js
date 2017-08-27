require('dotenv').config();
const Twitter = require('twitter');
var client = new Twitter({
                consumer_key: process.env.TWITTER_CONSUMER_KEY,
                consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
                access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
                access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
             });

function get_tweets() {
    let path = 'search/tweets';
    let params = {
        q:'',
        result_type: 'recent',
        count: 100, //maximum
        since_id_str:'',
        lang: 'en',
        tweet_mode: 'extended'
    };
    let pages = 0;
    let tweet_array = [];
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0
    let yyyy = today.getFullYear();
    today = yyyy + '-'+ mm + '-' + dd;

    params.q = `(@walmart since:${today} OR #walmart since:${today} OR walmart since:${today}) 
                AND (source:"Twitter for Android" OR source:"Twitter for iPhone" OR source:tweetdeck OR source:web)
                AND (-filter:retweets) AND (-filter:replies)`

    return new Promise((resolve,reject) =>{
        client.get(path,params)
        .then((tweets)=>{
            for(let x = 0;x < tweets.statuses.length;x++){
                tweet_array.push(tweets.statuses[x].full_text);
            };
            pages++;
            if (pages > 100 || tweet_array.length < 100 || params.since_id_str === tweets.search_metadata.max_id_str) {
                resolve(tweet_array);
            }
            else{
                params.since_id_str = tweets.search_metadata.max_id_str
                get_tweets(); //recursive implementation
            } 
        })
        .catch((error)=>{
            reject(error);
        });
    });
}

function verifyCredentials(access_token_key,access_token_secret) {
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

function getUserProfileInfo(user_id){
    let path = 'users/lookup'
    let params = {user_id:user_id}
    return new Promise((resolve,reject)=>{
        this.client.get(path,params)
        .then((user_account_info)=>{
            resolve(user_account_info);
        })
        .catch((error)=>{
            reject(error);
        });
    });
}

module.exports = {
    get_tweets: get_tweets,
    verifyCredentials:verifyCredentials,
    getUserProfileInfo:getUserProfileInfo
};