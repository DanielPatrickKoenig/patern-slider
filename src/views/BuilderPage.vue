<template>
    <div class="builder-page">
        <div v-if="ready" class="search-ui">
            <input v-model="searchTerm" type="text" v-on:keyup="searchResults()" />
            <ul v-if="searchTerm != ''">
                <li v-for="(result, key, i) in searchOutput.limitted" :key="'result-'+i.toString()">
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
            <div v-if="Object.keys(searchOutput.full).length > resultLimts.current">
                <label>
                    {{Object.keys(searchOutput.limitted).length}} / {{Object.keys(searchOutput.full).length}} results
                </label>
                <a
                    v-if="Object.keys(searchOutput.full).length > resultLimts.current"
                    v-on:click="showMore"
                >
                    Show More
                </a>
            </div>
            <div v-else>
                {{Object.keys(searchOutput.limitted).length}} Results
            </div>
        </div>
        <div 
            v-if="gameProperties.structureErrors.length > 0"
            class="puzzle-errors"
        >
            <PuzzlePreview
                v-for="(s, i) in gameProperties.structureErrors"
                :key="'structure-error-'+i.toString()" 
                :pattern="gameProperties.structureErrors[i]"
                :collisions="i == 0 ? gameProperties.errors.collisions : {}"
            />
        </div>
        <PuzzlePreview 
            v-else-if="gameProperties.structrue.length > 0" 
            :pattern="gameProperties.structrue" 
        />
        <ul class="puzzle-word-list">
            <li><label><span>Columns</span> <input type="number" v-model="gameProperties.columns" v-on:change="updatePuzzle" /></label></li>
            <li><label><span>Rows</span> <input type="number" v-model="gameProperties.rows" v-on:change="updatePuzzle" /></label></li>
            <li v-for="(word, i) in gameProperties.words" :key="'word-'+i.toString()">
                <label><span>Text</span> <input type="text" v-model="gameProperties.words[i].text" disabled /></label>
                <label><span>Direction</span> <select v-model="gameProperties.words[i].direction" v-on:change="updatePuzzle(i, true)"><option v-for="(direction, key, d) in directionOptions" :key="'direction-'+d.toString()" :value="direction">{{key}}</option></select></label>
                <label><span>Column</span> <input type="number" v-model="gameProperties.words[i].column" v-on:change="updatePuzzle(i)" /></label>
                <label><span>Row</span> <input type="number" v-model="gameProperties.words[i].row" v-on:change="updatePuzzle(i)" /></label>
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
// import {flatten} from '../utils/Utilities.js';
import PuzzlePreview from '../components/PuzzlePreview.vue';
const startSize = 7;
const initialBase = 100;
export default {
    components:{
        PuzzlePreview
    },
    data () {
        return {
            dictionary: {},
            loadedDictionaries: {},
            ready: true,
            searchTerm: '',
            searchOutput: {limitted: {}, full: {}},
            letters: ('abcdefghijklmnopqrstuvwxyz').split(''),
            selectedLetter: 'a',
            directionOptions: Directions,
            resultLimts: {
                current: initialBase,
                base: initialBase,
                moreIncrament: 50
            },
            gameProperties: {
                words: [],
                columns: startSize,
                rows: startSize,
                unconfirmedSize: {
                    columns: startSize,
                    rows: startSize
                },
                structrue: [],
                structureErrors: [],
                errors: {
                    collisions: {}
                }
            }
            
        }
    },
    methods: {
        async searchResults (adding) {
            let output = {};
            let fullOutput = {};
            if(this.searchTerm.length > 0){
                if(!adding){
                    this.resultLimts.current = initialBase;
                }
                const dictionaryLetter = this.searchTerm.slice(0, 1).toUpperCase();
                this.dictionary = this.loadedDictionaries[dictionaryLetter] ? this.loadedDictionaries[dictionaryLetter] : await this.loadLetter(dictionaryLetter);
                const keys = Object.keys(this.dictionary);
                for(let i = 0; i < keys.length; i++){
                    if(this.dictionary[keys[i]].word.toLowerCase().indexOf(this.searchTerm.toLowerCase()) == 0){
                        if(Object.keys(output).length < this.resultLimts.current){
                            output[keys[i]] = this.dictionary[keys[i]];
                        }
                        fullOutput[keys[i]] = this.dictionary[keys[i]];
                    }
                }
            }
            this.searchOutput = {limitted: output, full: fullOutput};
        },
        async loadLetter (letter) {
            // this.ready = false;
            this.selectedLetter = letter;
            const letterDictionary = await loadDictionarySection(letter.toUpperCase()); 
            // this.ready = true;
            this.loadedDictionaries[letter] = letterDictionary;
            return letterDictionary;
        },
        showMore() {
            this.resultLimts.current += this.resultLimts.moreIncrament;
            this.searchResults(true);
        },
        addWord (word, id) {
            this.gameProperties.words.push({text: word, id: id, direction: Directions.ACROSS, row: 0, column: 0});
            this.updatePuzzle();
        },
        updatePuzzle (index = -1, directionChange = false) {
            let isValidUpdate = true;
            if(index > -1){
                const maxPositions = this.getMaxumumRowColumn(this.gameProperties.words[index]);
                console.log(maxPositions);
                if(this.gameProperties.words[index].row > maxPositions.row){
                    // console.log('a');
                    if(!directionChange){
                        this.gameProperties.words[index].row = maxPositions.row;
                    }
                    isValidUpdate = false;
                }
                if(this.gameProperties.words[index].column > maxPositions.column){
                    // console.log('b');
                    if(!directionChange){
                        this.gameProperties.words[index].column = maxPositions.column;
                    }
                    isValidUpdate = false;
                }
                if(this.gameProperties.words[index].row < 0){
                    // console.log('c');
                    if(!directionChange){
                        this.gameProperties.words[index].row = 0;
                    }
                    isValidUpdate = false;
                }
                if(this.gameProperties.words[index].column < 0){
                    // console.log('d');
                    if(!directionChange){
                        this.gameProperties.words[index].column = 0;
                    }
                    isValidUpdate = false;
                }
                if(!isValidUpdate && directionChange){
                    this.gameProperties.words[index].direction = this.gameProperties.words[index].direction == Directions.ACROSS ? Directions.DOWN : Directions.ACROSS;
                }
            }
            else{
                const minSize = this.getMinimumGridSize();
                if(this.gameProperties.rows < minSize.rows){
                    this.gameProperties.rows = Number(this.gameProperties.unconfirmedSize.rows);
                    isValidUpdate = false;
                }
                if(this.gameProperties.columns < minSize.columns){
                    this.gameProperties.columns = Number(this.gameProperties.unconfirmedSize.columns);
                    isValidUpdate = false;
                }
            }
            if(isValidUpdate){
                this.gameProperties.structureErrors = [];
                this.gameProperties.unconfirmedSize.rows = Number(this.gameProperties.rows);
                this.gameProperties.unconfirmedSize.columns = Number(this.gameProperties.columns);
                const stru = createCrossword(this.gameProperties.rows, this.gameProperties.columns, this.gameProperties.words);
                // console.log(stru);
                if(stru){
                    this.gameProperties.structrue = [];
                    setTimeout(() => {
                        this.gameProperties.structrue = stru;
                    }, 100);
                }
                else{
                    setTimeout(() => {
                        this.gameProperties.structureErrors.push(createCrossword(this.gameProperties.rows, this.gameProperties.columns, []));
                        for(let i = 0; i < this.gameProperties.words.length; i++){
                            this.gameProperties.structureErrors.push(createCrossword(this.gameProperties.rows, this.gameProperties.columns, [this.gameProperties.words[i]]));
                        }
                        this.gameProperties.errors.collisions = this.getCollisions();
                    }, 100);
                }
            }
            else{
                this.showSizeLimitationError();
            }
        },
        getCollisions () {
            let cells = {};
            for (let i = 0; i < this.gameProperties.structureErrors.length; i++){
                for (let j = 0; j < this.gameProperties.structureErrors[i].length; j++) {
                    
                    for (let k = 0; k < this.gameProperties.structureErrors[i][j].length; k++) {
                        if(this.gameProperties.structureErrors[i][j][k] != ' '){
                            if(cells[`${j}.${k}`] == undefined){
                                cells[`${j}.${k}`] = [];
                            }
                            if(!cells[`${j}.${k}`].includes(this.gameProperties.structureErrors[i][j][k])){
                                cells[`${j}.${k}`].push(this.gameProperties.structureErrors[i][j][k]);
                            }
                        }
                        
                    }
                }
            }
            return cells;
        },
        getMaxumumRowColumn (wordData) {
            const maxRow = wordData.direction == Directions.DOWN ? Number(this.gameProperties.rows - wordData.text.split('').length) : Number(this.gameProperties.rows);
            const maxColumn = wordData.direction == Directions.ACROSS ? Number(this.gameProperties.columns - wordData.text.split('').length) : Number(this.gameProperties.columns);
            return {row: maxRow, column: maxColumn};
        },
        getMinimumGridSize () {
            let minSize = {rows: 3, columns: 3};
            for(let i = 0; i < this.gameProperties.words.length; i++) {
                let prop = '';
                switch(this.gameProperties.words[i].direction){
                    case Directions.ACROSS:{
                        prop = 'column';
                        break;
                    }
                    case Directions.DOWN:{
                        prop = 'row';
                        break;
                    }
                }
                let cellsRequired = Number(this.gameProperties.words[i][prop]) + Number(this.gameProperties.words[i].text.split('').length);
                if(cellsRequired > minSize[`${prop}s`]){
                    minSize[`${prop}s`] = cellsRequired;
                }
            }
            return minSize;
        },
        removeWord (index) {
            this.gameProperties.words.splice(index, 1);
            this.updatePuzzle();
        },
        createPuzzleLink () {
            // console.log('create puzzle link');
            // 14,12,A15700-0-5-1,G7712-1-2-3
            let puzzleLink = `${this.gameProperties.rows},${this.gameProperties.columns}`;
            for (let i = 0; i < this.gameProperties.words.length; i++) {
                puzzleLink += `,${this.gameProperties.words[i].id}-${this.gameProperties.words[i].direction.toString()}-${this.gameProperties.words[i].row.toString()}-${this.gameProperties.words[i].column.toString()}`
            }
            console.log(puzzleLink);
            return puzzleLink;
        },
        showSizeLimitationError () {
            alert('does not fit on board');
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