require('dotenv').config();
const models = require('../models/db');
const watson_language = require('../services/language_analyzer');


function updateKeywords(req,res){
    /*
    Parameters
    id,keywords
     */
    models.page.find({where:{managed_page_id:req.params.id}})
    .then((page)=>{
        return page.update({
            keywords:req.body.keywords.split(',')
        })
    })
    .then((updated_page)=>{
        res.status(200).json({message:'successfully updated'});
    })
    .catch((error)=>{
        console.log(error);
        res.status(400).json({message:error});
    });
}

function findKeywords(req,res){
    models.page.find({where:{managed_page_id:req.params.id}})
    .then((page)=>{
        res.status(200).json(page.keywords)
    })
    .catch((error)=>{
        res.status(400).json({message:error});
    });
}

function getAudienceTone(req,res){
    /*Params: Profile_id*/
    req.user.getAccount_Types()
    .then((user_accounts)=>{
        let account_pages = Promise.all(user_accounts.map((user)=>{
            return new Promise((resolve,reject)=>{
                user.User_Account.getPages()
                .then((account_page)=>{
                    let arr_page = [];
                    for(x = 0; x < account_page.length;x++){
                        arr_page.push({ id:account_page[x].id,
                                        page_id:account_page[x].managed_page_id,
                                        keywords:account_page[x].keywords
                                         });
                    }         
                    resolve(arr_page);
                })
                .catch((error)=>{
                    reject(error);
                })
            })
        }));

        return account_pages;
    })
    .then((account_pages)=>{
        let flattened = [].concat.apply([], account_pages);
        page = flattened.filter((page)=>{return page.page_id === req.params.id})
        if(!page){
           return Promise.reject('User does not have access to this page');
        }
        else{
            return models.sequelize.query(`SELECT tone,string_agg(array_to_string(post,';'),';') as posts
                                            FROM "Mention_Tones" 
                                            where page_id = :page_id
                                            and created_at between :from and :to
                                            GROUP BY page_id,tone`,
                                  {replacements:{page_id:page[0].id,from:req.body.from,to:req.body.to},
                                  type: models.sequelize.QueryTypes.SELECT})
        }
    })
    .then((tones)=>{
        res.json(tones);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

function getSentimentTone(req,res){
    /*Params: Profile_id*/
    req.user.getAccount_Types()
    .then((user_accounts)=>{
        let account_pages = Promise.all(user_accounts.map((user)=>{
            return new Promise((resolve,reject)=>{
                user.User_Account.getPages()
                .then((account_page)=>{
                    let arr_page = [];
                    for(x = 0; x < account_page.length;x++){
                        arr_page.push({ id:account_page[x].id,
                                        page_id:account_page[x].managed_page_id,
                                        keywords:account_page[x].keywords
                                         });
                    }         
                    resolve(arr_page);
                })
                .catch((error)=>{
                    reject(error);
                })
            })
        }));

        return account_pages;
    })
    .then((account_pages)=>{
        let flattened = [].concat.apply([], account_pages);
        page = flattened.filter((page)=>{return page.page_id === req.params.id})
        if(!page){
           return Promise.reject('User does not have access to this page');
        }
        else{
            let language_analyzer = new watson_language.LanguageAnalyzer();
            let keywords = language_analyzer.params.features.sentiment.targets.concat(page[0].keywords);
            console.log(JSON.stringify(keywords,null,2))
            return models.sequelize.query(`SELECT keyword,AVG(tone_score) score
                                            FROM "Keyword_Sentiments" 
                                            WHERE page_id = :page_id and keyword in (:keyword)
                                            AND created_at between :from and :to
                                            GROUP BY keyword`,
            {replacements:{page_id:page[0].id,keyword:keywords,from:req.body.from,to:req.body.to},
            type: models.sequelize.QueryTypes.SELECT})
        }
    })
    .then((tones)=>{
        res.json(tones);
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:error});
    });
}

module.exports = {
    findKeywords:findKeywords,
    updateKeywords:updateKeywords,
    getAudienceTone:getAudienceTone,
    getSentimentTone:getSentimentTone
}