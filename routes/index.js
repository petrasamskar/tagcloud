var express = require('express');
var Twitter = require('twitter');

//twitter credentials 
var client = new Twitter({
  consumer_key: 'FFrmHVvDDJieJoCAujLwPsGyh',
  consumer_secret: 'ty8HiMNj1MJGqIzNVkDpxgrb1snWkVZXTHS08XljN1uT9TawUw',
  access_token_key: '153865328-BpFvYuLVwPMwmwyKxYsaZFKnFc9lKeMlwO8wUL4A',
  access_token_secret: 'ffrfE54GeKxlwZo4pbNOiu5XnvCc3M74rAjEGyjccIsyi'
});
 

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('searchhashtag', { title: 'Sök' });
});

router.post('/tagcloud', function(req, res) {

  //get tweets of the given hashtag
	client.get('search/tweets', {q: '#'+ req.body.hashtag, count:100}, function(error, tweets, response){
   		
    //save all texts in a string
    var totalText;
    for (var i = 0; i < tweets.statuses.length; i++) {
        totalText += tweets.statuses[i].text;      
    }
    
    if (!totalText=="") {

      var filteredWords = getFilteredWords(totalText, req.body.hashtag);
      var frequencies = getFrequencies(filteredWords);     
      var sortedWords = getWordsSorted(frequencies);    
      
      var outputList= [];

      for (var x=0; x < sortedWords.length; x++) {
        var theWord = sortedWords[x];
        var percent = frequencies[theWord]/filteredWords.length;
             
        percent = setInterval(percent);

        //will be populated with the html, diffrent span classes depending of percentage
        outputList[x] = "<p class='" + "word"+percent + "'>" + sortedWords[x] + "</p>";
      }
       
      //render the words 
   		res.render('tagcloud', {
            title : 'Ordmoln',
            words : outputList
      });
    } else {
      res.render('searchhashtag', { title: 'Sök' });
    }

	});

  function getFilteredWords(totalText, searchWord) {
    
    var words = totalText.replace(/[^\w\s]/gi, '').split(/\s/);
    var filteredWords = [];
    
    //only add words longer than 2 chars, also remove urls
    for( var i = 0; i < words.length; i++ ) {
      if (words[i].length > 2 && words[i].indexOf("http") < 0 && searchWord.toLowerCase() != words[i].toLowerCase()) {
        filteredWords.push(words[i]);
      }
    }
    return filteredWords;
  }

  //depending on percentage, return a figure to be used when setting style class on the word
  function setInterval(percent) {
    percent = percent * 100;
 
    switch (true) {
      case (percent < 1):
        return 0;
        break;
      case (percent < 2):
        return 1;
        break;
      case  (percent < 4):
        return 3;
        break;
      case (percent < 6):
        return 5;
        break;
      case (percent < 7):
        return 6;
        break;
      case (percent < 10):
        return 10;
        break;
      default:
        return 20;
        break;

    }
  }

  //sets frequency per word
  function getFrequencies(words) {

    var frequencies = {}, word;
        
    for( var i = 0; i < words.length; i++ ) {
      word = words[i].toLowerCase();
      frequencies[word] = frequencies[word] || 0;
      frequencies[word]++;      
    }

    return frequencies;
    
  }

  //sorts and returns specified number of words
  function getWordsSorted(frequencies) {
    var words = Object.keys(frequencies);
    return words.sort(function (a,b) {
    return frequencies[b] - frequencies[a];}).slice(0,50);
  }

});

module.exports = router;
