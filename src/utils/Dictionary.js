import axios from 'axios';
const bannedWords = ["anal", "anus", "arse", "ass", "ballsack", "balls", "bastard", "bitch", "biatch", "bloody", "blowjob", "bollock", "bollok", "boner", "boob", "bugger", "bum", "butt", "buttplug", "clitoris", "cock", "coon", "crap", "cunt", "damn", "dick", "dildo", "dyke", "fag", "feck", "fellate", "fellatio", "felching", "fuck", "fudgepacker", "flange", "Goddamn", "hell", "homo", "jerk", "jizz", "knobend", "labia", "lmao", "lmfao", "muff", "nigger", "nigga", "omg", "penis", "piss", "poop", "prick", "pube", "pussy", "queer", "scrotum", "sex", "shit", "sh1t", "slut", "smegma", "spunk", "tit", "tosser", "turd", "twat", "vagina", "wank", "whore", "wtf"];
const validCharacters = ('abcdefghijklmnopqrstuvwxyz').split('');
function isValidWord (word) {
  const splitWord = word.toLowerCase().split('');
  let hasInvalidCharacter = false;
  for(let i = 0; i < splitWord.length; i++){
    if(!validCharacters.includes(splitWord[i])){
      hasInvalidCharacter = true;
    }
  }
  return !hasInvalidCharacter && !bannedWords.includes(word.toLowerCase());
}
async function loadDictionary () {
    let output = {};
      await axios.get('dictionary.csv').then((result) => {
        // console.log(result.data.split('\n"').length);
        const fullList = result.data.split('\n"');
        for(let i = 1; i < fullList.length; i++){
          const word = fullList[i].split('","')[0];
          if(word.split(' ').length == 1 && isValidWord(word)){
            output[word.split('')[0].toUpperCase() + (i.toString())] = {word: word, defenition: fullList[i].split('","')[2]};
          }
        }
      });
      return output;
}
async function loadDictionarySection (letter) {
    let output = {};
      await axios.get(`${letter}.csv`).then((result) => {
        // console.log(result.data.split('\n"').length);
        const fullList = result.data.split('\n');
        // console.log(fullList);
        for(let i = 1; i < fullList.length; i++){
          let str = fullList[i];
          str = str.replace(' (', 'open-paren');
          str = str.replace(') ', 'close-paren');
          const word = str.split('open-paren')[0].split('"').join('');
          if(word != '' && word.split(' ').length == 1 && isValidWord(word)){
            const def = str.split('close-paren')[1];
            output[word.split('')[0].toUpperCase() + (i.toString())] = {word: word, defenition: def};
          }
        }
      });
      return output;
}
export {loadDictionary, loadDictionarySection}