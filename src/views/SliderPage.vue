<template>
  <div>
      <a 
        v-for="(s, i) in structures" 
        :key="'structure-'+i.toString()" 
        v-on:click="selectedPattern = s"
    >
        <PuzzlePattern :structure="s" />
    </a>
      <SliderGame v-if="selectedPattern" :pattern="selectedPattern" />
  </div>
</template>

<script>
import {structures} from '../utils/GameLogic.js';
import PuzzlePattern from '../components/PuzzlePattern.vue';
import SliderGame from '../components/SliderGame.vue';
export default {
    components: {
        PuzzlePattern,
        SliderGame
    },
    data () {
        return {
            structures: structures.easy,
            selectedPattern: null
        }
    }
}
</script>

<style>

</style>