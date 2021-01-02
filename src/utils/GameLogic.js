import {shuffle, reshape} from './Utilities.js';
const dimensions = {rows: 7, columns: 7};

const structures = {
    easy:
        [
            [
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0]
            ],
            [
                [0, 0, 1, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 0],
                [0, 1, 1, 0, 1, 1, 0],
                [0, 1, 0, 0, 0, 1, 0],
                [0, 1, 1, 0, 1, 1, 0],
                [0, 0, 1, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 0]
            ],
            [
                [1, 0, 0, 0, 0, 0, 0],
                [1, 1, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 1, 1, 0],
                [0, 0, 0, 0, 0, 1, 1]
            ],
            [
                [0, 0, 1, 1 ,1, 0, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 0, 0]
            ],
            [
                [0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 0],
                [0, 1, 0, 0, 0, 1, 0],
                [0, 1, 0, 1, 0, 1, 0],
                [0, 1, 0, 0, 0, 1, 0],
                [0, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0]
            ]
        ]
};

function createRow(structure, targetRow = -1, empty = false){
    let row = [];
    for(let i = 0; i < dimensions.columns; i++){
        row.push(empty ? 0 : (Math.random() > .8 ? 1 : 0));
    }
    if(structure.length > targetRow || targetRow < 0){
        structure.splice(targetRow, 0, row);
    }
    else{
        structure.push(row);
    }
}
function checkMatch(targetPattern, testPesstern){
    let isMatch = true;
    for(let i = 0; i < targetPattern.length; i++){
        for(let j = 0; j < targetPattern[i].length; j++){
            const bpthEmpty = targetPattern[i][j] < 1 && testPesstern[i][j] < 1;
            const bothFull = targetPattern[i][j] > 0 && testPesstern[i][j] > 0;
            if((bpthEmpty && !bothFull) || (!bpthEmpty && bothFull)){
                isMatch = false;
            }
        }
    }
    return isMatch;
}
function randomizeStructure(structure){
    let oneDStrucure = [];
    for(let i = 0; i < structure.length; i++){
        for(let j = 0; j < structure[i].length; j++){
            oneDStrucure.push(structure[i][j]);
        }
    }
    const suffledStructure = shuffle(oneDStrucure);
    let reshapedStucture = reshape(suffledStructure, structure.length);
    return reshapedStucture;
    
}
function setupGame(){
    let structure = [];
    for(var i = 0; i < dimensions.rows; i++){
        createRow(structure);
    }
    return structure;
}
function getPiecesByProperty(pieces, property, value){
    let matches = [];
    for(let i = 0; i < pieces.length; i++){
        if(pieces[i][property] == value){
            matches.push(pieces[i]);
        }
    }
    return matches;
}
export {setupGame, getPiecesByProperty, structures, randomizeStructure, checkMatch};