var Twitter = require('twitter');
var client = new Twitter({
                consumer_key: process.env.TWITTER_CONSUMER_KEY,
                consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
                access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
                access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
             });

class TwitterService{
    constructor(){
        this.path = 'search/tweets';
        this.params = {
            q:'',
            result_type: 'recent',
            count: 100, //maximum
            since_id_str:'',
            lang: 'en',
            tweet_mode: 'extended'
        };
        this.client = client;
        this.pages = 0;
        this.get_tweets = (resolve,reject) => { 
            var tweet_array = [];
            this.client.get(this.path,this.params,(error,tweets,response) => {                   
                if(error){
                   reject(error);
                }
                else{
                    for(let x = 0;x < tweets.statuses.length;x++){
                        tweet_array.push(tweets.statuses[x].full_text);
                    };

                    this.pages++;

                    if (this.pages > 100 || tweet_array.length < 100 || this.params.since_id_str === tweets.search_metadata.max_id_str) {
                        resolve(tweet_array);
                    }
                    else{
                        this.params.since_id_str = tweets.search_metadata.max_id_str
                        this.get_tweets(resolve); //recursive implementation
                    } 
                }
            });
        }
    };
};

module.exports = {
    TwitterService: TwitterService
};