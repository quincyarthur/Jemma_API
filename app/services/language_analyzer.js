require('dotenv').config();
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
    username:process.env.LANGUAGE_ANALYZER_USER,
    password:process.env.LANGUAGE_ANALYZER_PASSWORD,
    version_date:process.env.LANGUAGE_ANALYZER_VERSION_DATE
});

class LanguageAnalyzer{
    constructor(){
        this.analyzer = natural_language_understanding;
        this.params = {
            'text': '',
            'features': 
            {
             'entities': {
                    'emotion': true,
                    'sentiment': true,
                    'limit': 1
              },
             /*'keywords': {
                'emotion': true,
                'sentiment': true,
                'limit': 5
              },*/
              'sentiment': {
                'targets': ['customer service','prices','service','employees']
              }
            }
        };
        this.analyze_text = (text) =>{
           return new Promise((resolve,reject)=>{
                               this.params.text = text;
                               this.analyzer.analyze(this.params, function(error, response) {
                                 if (error){
                                    reject(error);
                                 }  
                                 else{
                                   resolve(response);
                                 }
                                });
                        })
        };
    }    
}

LanguageAnalyzer.prototype.load_text = (text) =>{
    return new Promise ((resolve,reject) =>{
        let batch_text = [];
        let characters = '';

        for(let index = 0; index < text.length; index++){
            characters+=text[index] + ' \n';
            if (characters.length > 50000) { //language analyzer can only process 50,000 characters per request
                batch_text.push(characters);
                characters = '';
            }
            else if(index === text.length - 1){//if end of array and text still less than 50,000 chars add
                batch_text.push(characters);
            }
        }
        resolve(batch_text); 
    });
}

module.exports = {
    LanguageAnalyzer: LanguageAnalyzer
}