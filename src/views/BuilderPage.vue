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
                    </ul>
                </li>
            </ul>
        </div>
        <span v-if="ready">
            {{Object.keys(this.dictionary).length}}
        </span>
    </div>
</template>

<script>
import {loadDictionarySection} from '../utils/Dictionary.js';
export default {
    data () {
        return {
            dictionary: {},
            ready: false,
            searchTerm: '',
            searchOutput: {},
            letters: ('abcdefghijklmnopqrstuvwxyz').split(''),
            selectedLetter: 'a'
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
        }
    },
    mounted () {
        this.loadLetter('A');
    }
}
</script>

<style>

</style>