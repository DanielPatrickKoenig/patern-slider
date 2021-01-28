<template>
    <div>
        <div v-if="ready">
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
            searchOutput: {}
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
        }
    },
    async mounted () {
        this.dictionary = await loadDictionarySection('A'); 
        this.ready = true;
    }
}
</script>

<style>

</style>