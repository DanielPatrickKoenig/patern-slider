import axios from 'axios';
async function loadDictionary () {
    let output = {};
      await axios.get('dictionary.csv').then((result) => {
        // console.log(result.data.split('\n"').length);
        const fullList = result.data.split('\n"');
        for(let i = 1; i < fullList.length; i++){
          const word = fullList[i].split('","')[0];
          if(word.split(' ').length == 1 && word.split('-').length == 1 && word.split("'").length == 1){
            output[word.split('')[0].toUpperCase() + (i.toString())] = {word: word, defenition: fullList[i].split('","')[2]};
          }
        }
      });
      console.log(JSON.stringify(output));
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
          if(word != '' && word.split(' ').length == 1 && word.split('-').length == 1 && word.split("'").length == 1){
            const def = str.split('close-paren')[1];
            output[word.split('')[0].toUpperCase() + (i.toString())] = {word: word, defenition: def};
          }
        }
      });
      console.log(JSON.stringify(output));
      return output;
}
export {loadDictionary, loadDictionarySection}