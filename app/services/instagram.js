require('dotenv').config();
const request = require('request-promise-native');
const ig = require('instagram-node').instagram({});
/*
class Instagram {
    constructor(user_access_token){
        this.ig = require('instagram-node').instagram();
    }
}*/

function get_account_info(access_token) {
    return new Promise((resolve,reject)=>{
        var options = {
            uri: 'https://api.instagram.com/v1/users/self/',
            qs:{
                access_token:access_token
            },
            headers:{
                'User-Agent':'Request-Promise'
            },
            json: true
        };

        request(options)
        .then((user_profile)=>{
            resolve(user_profile);
        })
        .catch((error)=>{
            reject(error);
            console.log(`Error accessing Instagram API: ${error}`);
        })
    })
}

function get_posts(access_token){
    return new Promise((resolve,reject)=>{
        ig.use({access_token:access_token});
        var posts = []; //make posts global so that I can reference across interations (poor practice but I'm sleepy...ssoooo yeah)
        var ig_media = (err, medias, pagination, remaining, limit) => {
            if (err){
                console.log(`Error: ${err}`);
                return reject(err); 
            }
            else{   
                posts.push(medias.map((media)=>{
                    return {id:media.id,type:media.type,images:media.images.standard_resolution.url,
                            caption:media.text,likes:media.likes.count,comments:media.comments.count
                    }
                }));
            }

            if(pagination.next){
                pagination.next(ig_media);
            }
            else{
                return resolve([].concat.apply([], posts));
            }
            
        };

        return ig.user_self_media_recent(ig_media);
    })
}

function get_post_comments(access_token,post_id){
    return new Promise((resolve,reject)=>{
        ig.use({access_token:access_token});
        ig.comments(post_id,(err, result, remaining, limit) => {
            if (err){
                return reject(err);
                console.log(`Error: ${err}`);
            }
            else{ 
                let comments = result.map((post_comment)=>{
                    return {id:post_comment.id,text:post_comment.text}
                });
                return resolve(comments);
            }            
        });
    })

}

function get_profile_mentions(access_token,profile_id){

}

module.exports = {
    get_account_info:get_account_info,
    get_posts:get_posts,
    get_post_comments:get_post_comments
}