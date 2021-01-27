<template>
  <div>
      <a 
        v-for="(s, i) in structures" 
        :key="'structure-'+i.toString()" 
        v-on:click="selectedPattern = s.puzzle; selectedOverlay = s.overlay"
    >
        <PuzzlePattern :structure="s.puzzle" />
    </a>
      <SliderGame v-if="selectedPattern" :pattern="selectedPattern" :overlay="selectedOverlay" />
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
            structures: structures.medium,
            selectedPattern: null,
            selectedOverlay: null
        }
    }
}
</script>

<style>

</style>