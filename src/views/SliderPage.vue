<template>
    <div class="game-page">
        <a 
            v-for="(s, i) in structures" 
            :key="'structure-'+i.toString()" 
            v-on:click="setPattern(s)"
        >
            {{i}}
        </a>
        <SliderGame 
            v-if="selectedPattern" 
            :pattern="selectedPattern" 
            :overlay="selectedOverlay" 
        />
    </div>
</template>

<script>
// /slider?game=14,12,A15700-0-5-1,G7712-1-2-3
import {structures, createCrossword} from '../utils/GameLogic.js';
import {getParameterByName} from '../utils/Utilities.js';
import SliderGame from '../components/SliderGame.vue';
import {loadDictionarySection} from '../utils/Dictionary.js';
export default {
    components: {
        SliderGame
    },
    data () {
        return {
            structures: structures.medium,
            selectedPattern: null,
            selectedOverlay: null,
            dictionary: {}
        }
    },
    methods: {
        async setPattern (pattern) {
            this.selectedOverlay = pattern;
            for(let i = 0; i < pattern.words.length; i++) {
                let letter = pattern.words[i].id.split('')[0];
                if(!this.dictionary[letter]){
                    this.dictionary[letter] = await loadDictionarySection(letter);
                }
                const word = this.dictionary[letter][pattern.words[i].id];
                pattern.words[i].text = word.word;
                pattern.words[i].defenition = word.defenition;
                console.log(word);
                // pattern.words[i].word = word.word;
                // pattern.words[i].definition = word.definition;
            }
            this.selectedPattern = createCrossword(pattern.rows, pattern.columns, pattern.words);   
        }
    },
    mounted () {
        const gameDataString = getParameterByName('game');
        if(gameDataString){
            const gameData = gameDataString.split(',');
            const rows = Number(gameData[0]);
            const columns = Number(gameData[1]);
            const words = [];
            for(let i = 2; i < gameData.length; i++){
                const wordData = gameData[i].split('-');
                words.push({id: wordData[0], direction: Number(wordData[1]), row: Number(wordData[2]), column: Number(wordData[3])});
            }
            this.setPattern({rows: rows, columns: columns, words: words});
        }
    }
}
</script>

<style>

</style>