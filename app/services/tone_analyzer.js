require('dotenv').config();
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var tone_analyzer = new ToneAnalyzerV3({username:process.env.TONE_ANALYZER_USER,
                                             password:process.env.TONE_ANALYZER_PASSWORD,
                                             version_date:process.env.TONE_ANALYZER_VERSION_DATE});

class ToneAnalyzer{
  constructor(){
    this.analyzer = tone_analyzer;
    this.params = {text:'',tones:'emotion',sentences:true};
    this.analyze_text = (text) =>{  
      return new Promise((resolve,reject)=>{
        this.params.text = text;
        this.analyzer.tone(this.params, function(error, response) {
          if (error){
             reject(error);
          }  
          else{
              var tone_categories =  [{tone:'Anger',text:[]},{tone:'Disgust',text:[]},{tone:'Fear',text:[]},{tone:'Joy',text:[]},
                                      {tone:'Sadness',text:[]}
                                     ];
              for (let x = 0; x < response.sentences_tone.length; x++){
                    if (response.sentences_tone[x].tone_categories[0]){ //prevent error where tones are null
                      for(let y = 0; y < response.sentences_tone[x].tone_categories[0].tones.length;y++){
                        if(response.sentences_tone[x].tone_categories[0].tones[y].score >= 0.4){
                            let index = tone_categories.map((category)=>{return category.tone}).indexOf(response.sentences_tone[x].tone_categories[0].tones[y].tone_name);
                            tone_categories[index].text.push(response.sentences_tone[x].text);
                        }
                      }
                    }
              }
              resolve(tone_categories.filter((tone)=>{return tone.text.length > 0}));
          }
        });
      })
    };
  }
}

ToneAnalyzer.prototype.load_text = (text) =>{
  return new Promise((resolve,reject)=>{
    let batch = [];
    let input = '';
    for (let x = 0; x < text.length; x++){
      if((input.length + text[x].length < 50000 ) || x < 100 ){
        //tone alayzer will see new line characters in tweets and treat the new line as a seperate entity
        //replace new line and carriage returns with a space and add new line to seperate tweets
        input+= text[x].replace(/[.\n\r]+/g, ' ') + '\n';

        if(x === text.length - 1){
          batch.push(input);
        }
        
      }
      else{
        batch.push(input);
        input = '';
        input+=text[x].replace(/[\n\r]+/g, ' ') + '\n';
      }
    }
    resolve(batch);
  })
}

module.exports =  {
  ToneAnalyzer: ToneAnalyzer
};