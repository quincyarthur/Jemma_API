require('dotenv').config({path: '../../.env'});
const models = require('../../app/models/db');
const watson_language = require('../services/language_analyzer');
const watson_tone = require('../services/tone_analyzer');
const facebook_service =  require('../services/facebook');

function analyze_fb(){
    return Promise.resolve(accounts)
    .then((accounts)=>{
        //loop through the user facebook accounts
        for (let x = 0; x < accounts.length; x++){
        //loop through the pages tied to facebook accounts
            for (let y = 0; y < accounts[x].user_pages.length; y++){
                
            }
        }
    })
    .catch((error)=>{
        console.log(error);
    })
}

module.exports = {
    analyze_fb:analyze_fb
}