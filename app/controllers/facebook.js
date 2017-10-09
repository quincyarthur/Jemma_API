const fb_service = require('../services/facebook');
const facebook = new fb_service.Facebook();

function addAccount(req,res){
    return facebook.extend_user_access_token(req.body.temp_user_access_token)
    .then((extended_user_access_token)=>{
        res.status(200).json(extended_user_access_token);
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    })

}

module.exports = {
    addAccount:addAccount
}