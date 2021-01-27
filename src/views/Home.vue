<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <button v-on:click="ccTest">TEST</button>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import {createCrossword, Directions} from '@/utils/GameLogic.js'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  methods: {
    ccTest () {
      console.log(createCrossword(7,8,[
        {text: 'apple', direction: Directions.ACROSS, column: 1, row: 5},
        {text: 'grape', direction: Directions.DOWN, column: 3, row: 2}
      ]));
    }
  }
}
</script>
