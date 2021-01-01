<template>
  <div>
      <canvas ref="pixiTarget" />
  </div>
</template>

<script>
import {PixiInstance, PixiDraw, PixiUtils, PixiAction} from '../utils/PixiManager.js';
import {setupGame} from '../utils/GameLogic.js';
export default {
    data () {
        return {
            instance: {},
            draw: new PixiDraw(),
            structure: setupGame(),
            action: new PixiAction(),
            utils: new PixiUtils(),
            dragger: null,
            offset: {x: 0, y: 0}
        }
    },
    mounted () {
        this.instance = new PixiInstance(this.$refs.pixiTarget, 500, 500, true);
        let h = 0;
        let v = 0;
        const space = 60;
        for(let i = 0; i < this.structure.length; i++){
            h = 0;
            for(let j = 0; j < this.structure[i].length; j++){
                const sprite = this.utils.sprite();
                const color = this.structure[i][j] == 1 ? 0x00cc00 : 0xcc0000;
                const circle = this.draw.circle({fill: color, radius: space/2, x: space/2, y: space/2});
                sprite.addChild(circle);
                sprite.x = space*h;
                sprite.y = space*v;
                this.instance.getApp().stage.addChild(sprite);
                this.action.down(sprite, (e) => {
                    this.dragger = sprite;
                    this.offset = {x: e.x - sprite.x, y: e.y - sprite.y};

                });
                this.action.move(sprite, (e) => {
                    if(this.dragger){
                        this.dragger.x = e.x - this.offset.x;
                        this.dragger.y = e.y - this.offset.y;
                    }
                });
                this.action.up(sprite, () => {
                    this.dragger = null;
                });
                h++;
            }
            v++;
        }
    }
}
</script>

<style>

</style>