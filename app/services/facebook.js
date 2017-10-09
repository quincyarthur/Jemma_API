require('dotenv').config();
const FB = require('fb');

class Facebook{
    constructor(){
        this.extend_user_access_token = (resolve,reject,temp_access_token)=>{
            return new Promise((resolve,reject)=>{
                FB.api('oauth/access_token', {
                    client_id: process.env.FACEBOOK_APP_ID,
                    client_secret: process.env.FACEBOOK_APP_TOKEN,
                    grant_type: 'fb_exchange_token',
                    fb_exchange_token: temp_access_token
                }, function (res) {
                    if(!res || res.error) {
                        console.log(!res ? 'error occurred' : res.error);
                        return reject(res.error);
                    }
                    console.log(JSON.stringify(res.access_token,null,2))
                    return resolve(res.access_token);
                });
            })   
        };
        this.get_extended_page_access_token = (extended_user_access_token)=>{

        }
    }
}
module.exports = {
    Facebook:Facebook
}

