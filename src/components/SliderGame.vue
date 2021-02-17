<template>
  <div>
      <canvas ref="pixiTarget" style="max-width:100%;" />
  </div>
</template>

<script>
import {PixiInstance, PixiDraw, PixiUtils, PixiAction} from '../utils/PixiManager.js';
import {getPiecesByProperty, randomizeStructure, checkMatch, Directions} from '../utils/GameLogic.js';
import {reshape} from '../utils/Utilities.js';
export default {
    props:{
        pattern: Array,
        overlay: Object,
        clues: Array,
        highlight: Boolean
    },
    data () {
        return {
            instance: {},
            draw: new PixiDraw(),
            structure: randomizeStructure(this.pattern),
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
            pieces: [],
            originPoint: {x: 50, y: 50},
            boardSize: {width: 500, height: 500},
            boardBorder: 50,
            downOrigin: {x: 0, y: 0},
            minimumMoveDistance: 0,
            moving: false,
            tappedCell: {row: -1, column: -1},
            lastTapped: {row: -1, column: -1},
            highLighter: null
        }
    },
    watch: {
        highlight () {
            if(!this.highlight){
                this.highLighter.visible = false;
            }
        }
    },
    methods: {
        // snap(){
        //     for(let i = 0; i < this.dragGroup.length; i++){

        //     }
        // },
        moveGroup (property, e, space) {
            // const group = getPiecesByProperty(this.pieces, direction, this.dragger[direction]);
            const groupSize = property == 'x' ? this.pattern[0].length : this.pattern.length;
            // console.log(groupSize);
            for(let i = 0; i < this.dragGroup.length; i++){
                this.dragGroup[i][property] = e[property] - this.offset[property] - this.dragOffsets[i][property];
                if(this.dragGroup[i][property] > this.startCenters[groupSize - 1][property]){
                    // this.dragGroup[i][property] -= space * this.structure.length;
                    this.dragOffsets[i][property] += space * groupSize;
                }
                if(this.dragGroup[i][property] < this.startCenters[0][property] - space){
                    // this.dragGroup[i][property] += space * this.structure.length;
                    this.dragOffsets[i][property] -= space * groupSize;
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
        },
        renderStructure () {
            let userPattern = [];
            for(let i = 0; i < this.pieces.length; i++){
                userPattern.push(this.pieces[i].status);
            }
            return reshape(userPattern, this.pattern[0].length);
        },
        getRowColumnFromXY(x, y, space, origin){
            let h = 0;
            let v = 0;
            let rc = {row: -1, column: -1};
            for(let i = 0; i < this.structure.length; i++){
                h = 0;
                for(let j = 0; j < this.structure[i].length; j++){
                    // const tlAddOn = this.structure.length > 7 || this.structure[0].length > 7 ? space : 0;
                    // const brAddOn = this.structure.length > 7 || this.structure[0].length > 7 ? space * 2 : space;
                    const tlAddOn = this.structure[0].length > 11 ? space : space * .5;
                    const brAddOn = this.structure[0].length > 11 ? space * 2 : space * 1.5;
                    const tl = {x: (space * h) + origin.x + tlAddOn, y: (space * v) + origin.y + tlAddOn};
                    const br = {x: (space * h) + origin.x + brAddOn, y: (space * v) + origin.y + brAddOn};
                    if(x > tl.x && x < br.x && y > tl.y && y < br.y){
                        rc.row = v;
                        rc.column = h;
                    }
                    h++;
                }
                v++;
            }
            return rc;
        }
    },
    mounted () {
        this.instance = new PixiInstance(this.$refs.pixiTarget, this.boardSize.width, this.boardSize.height, true);
        let h = 0;
        let v = 0;
        let inset = 3;
        const space = (this.boardSize.width - (this.boardBorder * 2)) / this.structure[0].length;
        this.originPoint.y = (this.boardSize.height / 2) - ((this.structure.length / 2) * space);
        const puzzleBG = this.draw.rect({fill: 0x000000, fillOpacity: .35, strokeWidth: 0, strokeOpacity: 0, stroke: 0x000000, width: this.overlay.columns * space, height: this.overlay.rows * space, x: this.originPoint.x, y: this.originPoint.y});
        this.instance.getApp().stage.addChild(puzzleBG);
        this.highLighter = this.draw.rect({fill: 0x000000, fillOpacity: 0, strokeWidth: 2, strokeOpacity: 1, stroke: 0xcc0000, width: space, height: space, x: 0, y: 0});
        this.instance.getApp().stage.addChild(this.highLighter);
        this.highLighter.visible = false;
        for(let i = 0; i < this.overlay.words.length; i++){
            const wordLength = this.overlay.words[i].text.length;
            let move = {x: 0, y: 0};
            switch(this.overlay.words[i].direction){
                case Directions.ACROSS:
                    {
                        move.x = 1;
                        break;
                    }
                case Directions.DOWN:
                    {
                        move.y = 1;
                        break;
                    }
            }
            for(let j = 0; j < wordLength; j++){
                const sprite = this.utils.sprite();
                sprite.x = this.originPoint.x + (space*(this.overlay.words[i].column + (j * move.x)));
                sprite.y = this.originPoint.y + (space*(this.overlay.words[i].row + (j * move.y)));
                const wordStart = this.draw.rect({fill: j == 0 ? 0xfffc2a : 0xffffff, fillOpacity: 1, strokeWidth: 2, strokeOpacity: 1, stroke: 0x000000, width: space, height: space, x: 0, y: 0});
                sprite.addChild(wordStart);
                this.instance.getApp().stage.addChild(sprite);
            }

        }
        for(let i = 0; i < this.structure.length; i++){
            h = 0;
            for(let j = 0; j < this.structure[i].length; j++){
                const sprite = this.utils.sprite();
                // const color = this.structure[i][j] == 1 ? 0x00cc00 : 0xcc0000;
                const empty = this.draw.rect({fill: 0x000000, fillOpacity: .06, strokeWidth: 2, strokeOpacity: 0, stroke: 0xffffff, width: space - (inset * 2), height: space - (inset * 2), x: inset, y: inset});
                sprite.addChild(empty);
                const full = this.draw.rect({fill: 0x00cc00, fillOpacity: .8, strokeWidth: 2, strokeOpacity: 0, stroke: 0xffffff, width: space - (inset * 2), height: space - (inset * 2), x: inset, y: inset});
                sprite.addChild(full);
                const text = this.utils.text(this.structure[i][j].toUpperCase(), {fontSize: space / 2});
                text.x = space / 2;
                text.y = space / 2;
                text.anchor.set(0.5);
                sprite.addChild(text);
                const bg = this.draw.rect({fill: 0x000000, fillOpacity: .000001, strokeWidth: 0, strokeOpacity: 0, stroke: 0xffffff, width: space, height: space, x: 0, y: 0});
                sprite.addChild(bg);
                empty.visible = this.structure[i][j] == 0 || this.structure[i][j] == ' ';
                full.visible = this.structure[i][j] != 0 && this.structure[i][j] != ' ';
                this.pieces.push(sprite);
                sprite.x = this.originPoint.x + (space*h);
                sprite.y = this.originPoint.y + (space*v);
                sprite.h = h;
                sprite.v = v;
                sprite.status = this.structure[i][j];
                this.instance.getApp().stage.addChild(sprite);
                this.action.down(sprite, (e) => {
                    this.dragger = sprite;
                    this.downOrigin = e;
                    this.offset = {x: e.x - sprite.x, y: e.y - sprite.y};
                    this.dragCycles = 0;
                    this.dragStart = e;
                    this.dragDirection = null;
                    this.moving = false;
                    this.minimumMoveDistance = space / 2;
                    this.tappedCell = this.getRowColumnFromXY(e.x, e.y, space, this.offset);
                });
                this.action.move(sprite, (e) => {
                    const canMove = Math.abs(this.downOrigin.x - e.x) > this.minimumMoveDistance || Math.abs(this.downOrigin.y - e.y) > this.minimumMoveDistance;
                    if(this.dragger && (canMove || this.moving)){
                        this.moving = true;
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
                            console.log(this.dragGroup[i].status);
                            this.dragGroup[i].x = this.startCenters[i].x - (space / 2);
                            this.dragGroup[i].y = this.startCenters[i].y - (space / 2);
                            const empty = this.dragGroup[i].children[0];
                            const full = this.dragGroup[i].children[1];
                            this.dragGroup[i].children[2].text = this.dragGroup[i].status.toUpperCase();
                            empty.visible = this.dragGroup[i].status == 0 || this.dragGroup[i].status == ' ';
                            full.visible = this.dragGroup[i].status == 1 || this.dragGroup[i].status != ' ';
                        }
                    }
                    if(!this.moving){
                        // alert('tap')

                        for(let i = 0; i < this.clues.length; i++){
                            if(this.tappedCell.row == this.clues[i].row && this.tappedCell.column == this.clues[i].column){
                                this.lastTapped = {row: this.tappedCell.row, column: this.tappedCell.column};
                                this.highLighter.visible = true;
                                this.$emit('clue-selected', this.clues[i]);
                            }
                        }
                        this.highLighter.x = this.originPoint.x + (space * this.lastTapped.column);
                        this.highLighter.y = this.originPoint.y + (space * this.lastTapped.row);
                    }
                    // console.log(this.renderStructure());
                    // console.log(this.pattern);
                    console.log(checkMatch(this.renderStructure(), this.pattern));
                });
                h++;
            }
            v++;
        }
        for(let i = 0; i < this.clues.length; i++){
            const sprite = this.utils.sprite();
            const text = this.utils.text(this.clues[i].number.toString(), {fontSize: space * .3});
            text.x = space * .2;
            text.y = space * .2;
            text.anchor.set(0.5);
            sprite.addChild(text);
            sprite.x = this.originPoint.x + (space*this.clues[i].column);
            sprite.y = this.originPoint.y + (space*this.clues[i].row);
            this.instance.getApp().stage.addChild(sprite);
        }
        this.instance.getApp().stage.addChild(this.highLighter);
        this.highLighter.visible = false;
        
        
    }
}
</script>

<style>

</style>