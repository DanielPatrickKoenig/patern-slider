<template>
    <div class="game-page">
        <SliderGame 
            v-if="selectedPattern" 
            :pattern="selectedPattern" 
            :overlay="selectedOverlay" 
            :clues="clues"
            :highlight="highlightClue"
            :block="wordBlock"
            v-on:clue-selected="showClue"
            v-on:word-solved="wordSolved"
        />
        <!-- <div v-if="selectedClue">
            <a v-on:click="closeClue">Close</a>
            <div v-if="selectedClue.across">
                <h2>Across</h2>
                <p>{{selectedClue.across.text.length}} letters</p>
                <p v-if="selectedClue.across.solved">{{selectedClue.across.text}}</p>
                <p>{{selectedClue.across.defenition}}</p>
             </div>
             <div v-if="selectedClue.down">
                <h2>Down</h2>
                <p>{{selectedClue.down.text.length}} letters</p>
                <p v-if="selectedClue.down.solved">{{selectedClue.down.text}}</p>
                <p>{{selectedClue.down.defenition}}</p>
             </div>
        </div> -->
        <div class="clue-selector">
            <div 
                v-if="selectedPattern"
                class="clue-lists"
            >
                <h2>Across</h2>
                <ul>
                    <li 
                        v-for="(clue, i) in clues" 
                        :key="'across-'+i.toString()"
                        class="clue-number"
                        v-show="clue.across"
                        v-on:click="setBlock(clue, directions.ACROSS)"
                    >
                        <span v-if="clue.across">
                            <span :class="{'solved': clue.across.solved}">
                                {{clue.number}}
                            </span>
                            
                        </span>
                    </li>
                </ul>
                <h2>Down</h2>
                <ul>
                    <li 
                        v-for="(clue, i) in clues" 
                        :key="'down-'+i.toString()"
                        class="clue-number"
                        v-show="clue.down"
                        v-on:click="setBlock(clue, directions.DOWN)"
                    >
                        <span v-if="clue.down">
                            <span :class="{'solved': clue.down.solved}">
                                {{clue.number}}
                            </span>
                            
                        </span>
                    </li>
                </ul>
            </div>
            <div class="clue-display">
                <div v-if="selectedClue">
                    <a 
                        v-on:click="closeClue"
                        class="close-clue"
                    >
                        X
                    </a>
                    <h2>{{selectedClueName}}</h2>
                    <p>{{selectedClue.text.length}} letters</p>
                    <p v-if="selectedClue.solved">{{selectedClue.text}}</p>
                    <p>{{selectedClue.defenition}}</p>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
// /slider?game=14,12,A15700-0-5-1,G7712-1-2-3
// /slider?game=14,14,A7630-0-2-0,L5412-1-0-4,R2842-0-0-1,E7764-1-0-2,S29052-0-5-1,T5420-1-0-7,G122-1-5-6,O5682-1-4-9,D9128-0-7-6,F432-0-8-1,D16448-1-8-3,C9288-0-10-3,U42-1-9-8,S12186-1-6-11,V694-1-1-13,P29166-0-3-11,G10172-1-0-11,P12590-0-12-0,L9222-0-12-8
import {structures, createCrossword, Directions} from '../utils/GameLogic.js';
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
            dictionary: {},
            clues: [],
            selectedClue: null,
            selectedClueName: '',
            highlightClue: false,
            wordBlock: {visible: false},
            directions: Directions
        }
    },
    methods: {
        setBlock (clue, direction) {

            this.wordBlock = {
                visible: true,
                direction,
                row: clue.row,
                column: clue.column,
                length: direction == Directions.ACROSS ? clue.across.text.length : clue.down.text.length
            }
            this.selectedClueName = `${clue.number} ${direction == Directions.ACROSS ? 'accross' : 'down'}`;
            this.showClue(clue, direction == Directions.ACROSS);
            console.log(this.wordBlock);
        },
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
                // console.log(word);
                // pattern.words[i].word = word.word;
                // pattern.words[i].definition = word.definition;
            }
            this.selectedPattern = createCrossword(pattern.rows, pattern.columns, pattern.words); 
            this.createClues();
            
        },
        createClues () {
            let num = 1;
            this.clues = [];
            for(let i = 0; i < this.selectedOverlay.words.length; i++){
                console.log(this.selectedOverlay.words[i].text);
                let data = {text: this.selectedOverlay.words[i].text, defenition: this.selectedOverlay.words[i].defenition, solved: this.selectedOverlay.words[i].solved ? true : false};
                let clue = null;
                const clueIndex = this.getWordIndex(this.selectedOverlay.words[i].row, this.selectedOverlay.words[i].column, this.selectedOverlay.words[i].direction);
                console.log(clueIndex);
                if(clueIndex < 0){
                    clue = {
                        number: num,
                        row: this.selectedOverlay.words[i].row,
                        column: this.selectedOverlay.words[i].column,
                        direction: this.selectedOverlay.words[i].direction,
                    };
                    this.clues.push(clue);
                    num++;
                }
                else{
                    clue = this.clues[clueIndex];
                }
                switch(this.selectedOverlay.words[i].direction){
                    case Directions.ACROSS:{
                        clue.across = data;
                        break;
                    }
                    case Directions.DOWN:{
                        clue.down = data;
                        break;
                    }
                }
            }
        },
        getWordIndex (row, column, direction) {
            let index = -1;
            for(let i = 0; i < this.clues.length; i++){
                if(this.clues[i].row == row && this.clues[i].column == column && this.clues[i].direction != direction){
                    index = i;
                }
            }
            return index;
        },
        showClue (clue, across) {
            // this.highlightClue = true;
            this.selectedClue = across ? clue.across : clue.down;
        },
        closeClue () {
            // this.highlightClue = false;
            this.wordBlock = {visible: false};
            this.selectedClue = null;
        },
        wordSolved (e) {
            this.selectedOverlay.words[e.index].solved = true;
            this.createClues();
            this.$forceUpdate();
        }
    },
    mounted () {
        const _gs = getParameterByName('game');
        const gameDataString = _gs ? _gs : '14,14,A7630-0-2-0,L5412-1-0-4,R2842-0-0-1,E7764-1-0-2,S29052-0-5-1,T5420-1-0-7,G122-1-5-6,O5682-1-4-9,D9128-0-7-6,F432-0-8-1,D16448-1-8-3,C9288-0-10-3,U42-1-9-8,S12186-1-6-11,V694-1-1-13,P29166-0-3-11,G10172-1-0-11,P12590-0-12-0,L9222-0-12-8';
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