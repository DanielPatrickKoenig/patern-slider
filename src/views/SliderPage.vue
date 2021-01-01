<template>
  <div>
      <canvas ref="pixiTarget" />
  </div>
</template>

<script>
import {PixiInstance, PixiDraw, PixiUtils, PixiAction} from '../utils/PixiManager.js';
import {setupGame, getPiecesByProperty} from '../utils/GameLogic.js';
export default {
    data () {
        return {
            instance: {},
            draw: new PixiDraw(),
            structure: setupGame(),
            action: new PixiAction(),
            utils: new PixiUtils(),
            dragger: null,
            dragCycles: 0,
            dragCycleMax: 15,
            dragStart: {x: 0, y: 0},
            dragDirection: null,
            dragGroup: [],
            dragOffsets: [],
            startCenters: [],
            offset: {x: 0, y: 0},
            pieces: []
        }
    },
    methods: {
        // snap(){
        //     for(let i = 0; i < this.dragGroup.length; i++){

        //     }
        // },
        moveGroup (property, e, space) {
            // const group = getPiecesByProperty(this.pieces, direction, this.dragger[direction]);
            for(let i = 0; i < this.dragGroup.length; i++){
                this.dragGroup[i][property] = e[property] - this.offset[property] - this.dragOffsets[i][property];
                if(this.dragGroup[i][property] > this.startCenters[this.structure.length - 1][property]){
                    // this.dragGroup[i][property] -= space * this.structure.length;
                    this.dragOffsets[i][property] += space * this.structure.length;
                }
                if(this.dragGroup[i][property] < this.startCenters[0][property] - space){
                    // this.dragGroup[i][property] += space * this.structure.length;
                    this.dragOffsets[i][property] -= space * this.structure.length;
                }
            }
        },
        getGroupOffsets () {
            let offsets = [];
            for(let i = 0; i < this.dragGroup.length; i++){
                offsets.push({x: this.dragger.x - this.dragGroup[i].x, y: this.dragger.y - this.dragGroup[i].y});
            }
            return offsets;
        },
        getStartCenters (space) {
            let centers = [];
            for(let i = 0; i < this.dragGroup.length; i++){
                centers.push({x: this.dragGroup[i].x + (space / 2), y: this.dragGroup[i].y + (space / 2)});
            }
            return centers;
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
                // const color = this.structure[i][j] == 1 ? 0x00cc00 : 0xcc0000;
                const empty = this.draw.circle({fill: 0xcc0000, radius: space/2, x: space/2, y: space/2});
                sprite.addChild(empty);
                const full = this.draw.circle({fill: 0x00cc00, radius: space/2, x: space/2, y: space/2});
                sprite.addChild(full);
                empty.visible = this.structure[i][j] == 0;
                full.visible = this.structure[i][j] == 1;
                this.pieces.push(sprite);
                sprite.x = space*h;
                sprite.y = space*v;
                sprite.h = h;
                sprite.v = v;
                sprite.status = this.structure[i][j];
                this.instance.getApp().stage.addChild(sprite);
                this.action.down(sprite, (e) => {
                    this.dragger = sprite;
                    this.offset = {x: e.x - sprite.x, y: e.y - sprite.y};
                    this.dragCycles = 0;
                    this.dragStart = e;
                    this.dragDirection = null;
                });
                this.action.move(sprite, (e) => {
                    
                    if(this.dragger){
                        this.dragCycles++;
                        
                        if(this.dragCycles > this.dragCycleMax && !this.dragDirection){
                            this.dragDirection = Math.abs(this.dragStart.x - e.x) > Math.abs(this.dragStart.y - e.y) ? 'v' : 'h';
                            this.dragGroup = getPiecesByProperty(this.pieces, this.dragDirection, this.dragger[this.dragDirection]);
                            this.dragOffsets = this.getGroupOffsets();
                            this.startCenters = this.getStartCenters(space);
                        }
                        else if(this.dragDirection == 'h'){
                            // this.dragger.x = e.x - this.offset.x;
                            this.moveGroup('y', e, space);
                        }
                        else if(this.dragDirection == 'v'){
                            // this.dragger.y = e.y - this.offset.y;
                            this.moveGroup('x', e, space);
                        }
                    }
                });
                this.action.up(sprite, () => {
                    // console.log(this.dragger);
                    this.dragger = null;
                    if(this.dragDirection){
                        const sortProp = this.dragDirection == 'h' ? 'y' : 'x';
                        let dragPragPropertyList = [];
                        for(let i = 0; i < this.dragGroup.length; i++){
                            dragPragPropertyList.push({x: this.dragGroup[i].x, y: this.dragGroup[i].y, status: this.dragGroup[i].status});
                        }
                        const sortedDragGroup = dragPragPropertyList.sort((a, b) => (a[sortProp] > b[sortProp]) ? 1 : -1);
                        for(let i = 0; i < this.dragGroup.length; i++){
                            this.dragGroup[i].status = sortedDragGroup[i].status;
                            this.dragGroup[i].x = this.startCenters[i].x - (space / 2);
                            this.dragGroup[i].y = this.startCenters[i].y - (space / 2);
                            const empty = this.dragGroup[i].children[0];
                            const full = this.dragGroup[i].children[1];
                            empty.visible = this.dragGroup[i].status == 0;
                            full.visible = this.dragGroup[i].status == 1;
                        }
                    }
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