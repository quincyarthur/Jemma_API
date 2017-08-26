require('dotenv').config();
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var tone_analyzer = new ToneAnalyzerV3({username:process.env.TONE_ANALYZER_USER,
                                             password:process.env.TONE_ANALYZER_PASSWORD,
                                             version_date:process.env.TONE_ANALYZER_VERSION_DATE});

class ToneAnalyzer{
  constructor(){
    this.analyzer = tone_analyzer;
    this.params = {text:'',tones:'emotion',sentences:true};
  }
}

module.exports =  {
  ToneAnalyzer: ToneAnalyzer
};