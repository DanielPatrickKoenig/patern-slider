<template>
    <div class="builder-page">
        <select class="letter-select" v-model="selectedLetter" v-on:change="loadLetter(selectedLetter)">
            <option v-for="(letter, i) in letters" :key="'letter-option-'+i.toString()" :value="letter">{{letter}}</option>
        </select>
        <ul class="letter-list">
            <li v-for="(letter, i) in letters" :key="'letter-'+i.toString()">
                <a v-on:click="loadLetter(letter)">{{letter}}</a>
            </li>
        </ul>
        <div v-if="ready" class="search-ui">
            <input v-model="searchTerm" type="text" v-on:keyup="searchResults" />
            <ul v-if="searchTerm != ''">
                <li v-for="(result, key, i) in searchOutput" :key="'result-'+i.toString()">
                    <ul>
                        <li>
                            {{result.word}}
                        </li>
                        <li>
                            {{result.defenition}}
                        </li>
                        <li>
                            <button v-on:click="addWord(result.word, key)">
                                Add
                            </button>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <span v-if="ready">
            {{Object.keys(this.dictionary).length}}
        </span>
        <PuzzlePreview 
            v-if="gameProperties.structrue.length > 0" 
            :pattern="gameProperties.structrue" 
        />
        <ul class="puzzle-word-list">
            <li><label><span>Columns</span> <input type="number" v-model="gameProperties.columns" v-on:change="updatePuzzle" /></label></li>
            <li><label><span>Rows</span> <input type="number" v-model="gameProperties.rows" v-on:change="updatePuzzle" /></label></li>
            <li v-for="(word, i) in gameProperties.words" :key="'word-'+i.toString()">
                <label><span>Text</span> <input type="text" v-model="gameProperties.words[i].text" disabled /></label>
                <label><span>Direction</span> <select v-model="gameProperties.words[i].direction" v-on:change="updatePuzzle"><option v-for="(direction, key, d) in directionOptions" :key="'direction-'+d.toString()" :value="direction">{{key}}</option></select></label>
                <label><span>Column</span> <input type="number" v-model="gameProperties.words[i].column" v-on:change="updatePuzzle" /></label>
                <label><span>Row</span> <input type="number" v-model="gameProperties.words[i].row" v-on:change="updatePuzzle" /></label>
                <button v-on:click="removeWord(i)">DELETE</button>
            </li>
            <li>
                <button v-on:click="createPuzzleLink">
                    Create Link
                </button>
            </li>
        </ul>

    </div>
</template>

<script>
import {loadDictionarySection} from '../utils/Dictionary.js';
import {createCrossword, Directions} from '../utils/GameLogic.js';
import PuzzlePreview from '../components/PuzzlePreview.vue';
export default {
    components:{
        PuzzlePreview
    },
    data () {
        return {
            dictionary: {},
            ready: false,
            searchTerm: '',
            searchOutput: {},
            letters: ('abcdefghijklmnopqrstuvwxyz').split(''),
            selectedLetter: 'a',
            directionOptions: Directions,
            gameProperties: {
                words: [],
                columns: 7,
                rows: 7,
                structrue: []
            }
            
        }
    },
    methods: {
        searchResults () {
            let output = {};
            const keys = Object.keys(this.dictionary);
            if(this.searchTerm.length > 0){
                for(let i = 0; i < keys.length; i++){
                    if(this.dictionary[keys[i]].word.toLowerCase().indexOf(this.searchTerm.toLowerCase()) == 0){
                        output[keys[i]] = this.dictionary[keys[i]];
                    }
                }
            }
            this.searchOutput = output;
        },
        async loadLetter (letter) {
            this.ready = false;
            this.selectedLetter = letter;
            this.dictionary = await loadDictionarySection(letter.toUpperCase()); 
            this.ready = true;
        },
        addWord (word, id) {
            this.gameProperties.words.push({text: word, id: id, direction: Directions.ACROSS, row: 0, column: 0});
            this.updatePuzzle();
        },
        updatePuzzle () {
            
            const stru = createCrossword(this.gameProperties.rows, this.gameProperties.columns, this.gameProperties.words);
            console.log(stru);
            if(stru){
                this.gameProperties.structrue = [];
                setTimeout(() => {
                    this.gameProperties.structrue = stru;
                }, 100);
            }
        },
        removeWord (index) {
            this.gameProperties.words.splice(index, 1);
            this.updatePuzzle();
        },
        createPuzzleLink () {
            console.log('create puzzle link');
            // 14,12,A15700-0-5-1,G7712-1-2-3
            let puzzleLink = `${this.gameProperties.rows},${this.gameProperties.columns}`;
            for (let i = 0; i < this.gameProperties.words.length; i++) {
                puzzleLink += `,${this.gameProperties.words[i].id}-${this.gameProperties.words[i].direction.toString()}-${this.gameProperties.words[i].row.toString()}-${this.gameProperties.words[i].column.toString()}`
            }
            console.log(puzzleLink);
            return puzzleLink;
        }
    },
    mounted () {
        this.loadLetter('A');
        this.gameProperties.structrue = createCrossword(this.gameProperties.rows, this.gameProperties.columns, this.gameProperties.words);
    }
}
</script>

<style>

</style>