require('dotenv').config();
const FB = require('fb');
const request = require('request');

class Facebook{
    constructor(){
        this.extend_user_access_token = (temp_access_token)=>{
            return new Promise((resolve,reject)=>{
                FB.api('oauth/access_token', {
                    client_id: process.env.FACEBOOK_APP_ID,
                    client_secret: process.env.FACEBOOK_APP_SECRET,
                    grant_type: 'fb_exchange_token',
                    fb_exchange_token: temp_access_token
                },(res) => {
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
            return new Promise((resolve,reject)=>{
                FB.api('me/accounts',{access_token:extended_user_access_token},(res)=>{
                    if(!res || res.error) {
                        console.log(!res ? 'error occurred' : res.error);
                        return reject(res.error);
                    }

                    if('next' in res){
                        let arr_response = this.getPages(res.paging.next,res.data);
                        return resolve(arr_response.map((page)=>{ return {id:page.id,extended_access_token: page.access_token}}));    
                    }
                    else{
                        return resolve(res.data.map((page)=>{ return {id:page.id,extended_access_token: page.access_token}})); //response only has one page of data
                    }
                    
                })
            })
        };
        this.get_user_posts = (extended_user_access_token) =>{
            return new Promise((resolve,reject)=>{
                FB.api('me/posts',{access_token:extended_user_access_token},(res)=>{
                    if(!res || res.error) {
                        console.log(!res ? 'error occurred' : res.error);
                        return reject(res.error);
                    }

                    if('next' in res){
                        let arr_response = this.getPages(res.paging.next,res.data);
                        return resolve(arr_response);
                    }
                    else{
                        return resolve(res.data); //response only has one page of data  
                    }
                })
            });
        };
        this.get_page_posts = (extended_user_access_token,page_id) =>{
            return new Promise((resolve,reject)=>{
                FB.api(`${page_id}/posts`,{access_token:extended_user_access_token},(res)=>{
                    
                    if(!res || res.error) {
                        console.log(!res ? 'error occurred' : res.error);
                        return reject(res.error);
                    }

                    if('next' in res){
                        let arr_response = this.getPages(res.paging.next,res.data);
                        return resolve(arr_response); 
                    }
                    else{
                        return resolve(res.data); //response only has one page of data 
                    }
                     
                })
            });
        };
        this.get_page_comments = (extended_user_access_token,post_id) =>{
            return new Promise((resolve,reject)=>{
                FB.api(`${post_id}/comments`,{access_token:extended_user_access_token},(res)=>{                  
                    if(!res || res.error) {
                        console.log(!res ? 'error occurred' : res.error);
                        return reject(res.error);
                    }
                    
                    if('next' in res){
                        let arr_response = this.getPages(res.paging.next,res.data);
                        return resolve(arr_response);  
                    }
                    else{
                        return resolve(res.data); //response only has one page of data
                    }  
                })
            });
        };
        this.getPages = (next_url,prev_array) =>{
            return new Promise((resolve,reject)=>{
                request(next_url, function (err, res, body) {
                    if(err){
                        reject(error);
                    }
                    else{
                        resolve(JSON.parse(body));
                    }
                })
            })
            .then((body)=>{
                prev_array.push(body.data);
                if ('next' in body){
                    this.getPages(body.paging.next,prev_array);
                }  
                return [].concat.apply([],prev_array);
            })
            .catch((error)=>{
                console.log(error);
            })
        };
    }
}

module.exports = {
    Facebook:Facebook
}

