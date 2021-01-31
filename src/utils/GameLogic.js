import {shuffle, reshape} from './Utilities.js';

const Directions = {
    ACROSS: 0,
    DOWN: 1
}


const puzzles = [{
    rows: 14, columns: 12, words: [
        {id: 'A15700', direction: Directions.ACROSS, column: 1, row: 5},
        {id: 'G7712', direction: Directions.DOWN, column: 3, row: 2}
    ]
}];

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
            ],
            [
                [" ", " ", "h", " ", " ", " ", " ", " ", " ", " "],
                [" ", "w", "a", "t", "e", "r", " ", " ", " ", " "],
                [" ", " ", "p", " ", "l", " ", " ", " ", " ", " "],
                ["a", "p", "p", "l", "e", " ", "a", " ", " ", " "],
                [" ", " ", "y", " ", "v", "e", "x", " ", " ", " "],
                ["a", " ", " ", " ", "e", " ", "e", " ", " ", " "],
                ["s", "p", "o", "o", "n", " ", " ", " ", " ", " "],
                ["k", " ", " ", " ", " ", " ", " ", " ", " ", " "]
            ],
            [
                [" ", " ", " ", " ", " ", " ", " "],
                [" ", "w", "a", "t", "e", "r", " "],
                [" ", " ", " ", " ", " ", " ", " "]
            ]
        ],
    medium: [
        puzzles[0]
    ]
};

function createRow(columns, structure){
    let row = [];
    for(let i = 0; i < columns; i++){
        row.push(" ");
    }
    structure.push(row);
}
function checkMatch(targetPattern, testPesstern){
    let isMatch = true;
    for(let i = 0; i < targetPattern.length; i++){
        for(let j = 0; j < targetPattern[i].length; j++){
            if(targetPattern[i][j].toString().split('.')[0] != testPesstern[i][j].toString().split('.')[0]){
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
    let reshapedStucture = reshape(suffledStructure, structure[0].length);
    return reshapedStucture;
    
}
function setupGame(columns, rows){
    let structure = [];
    for(var i = 0; i < rows; i++){
        createRow(columns, structure);
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
function addWord(grid, text, direction, _column, _row){
    const column = Number(_column);
    const row = Number(_row);
    let valid = true;
    let move = {row: 0, column: 0};
    switch (direction){
        case Directions.ACROSS:
            {
                move.column = 1;
                break;
            }
        case Directions.DOWN:
            {
                move.row = 1;
                break;
            }
    }
    const letters = text.split('');
    for(let i = 0; i < letters.length; i++){
        if(grid[row + (i * move.row)][column + (i * move.column)] == ' ' || grid[row + (i * move.row)][column + (i * move.column)] == letters[i]){
            grid[row + (i * move.row)][column + (i * move.column)] = letters[i];
        }
        else{
            valid = false;
        }
    }
    return valid;
}
function createCrossword(rows, columns, wordList){
    let valid = true;
    let grid = [];
    for(let i = 0; i < rows; i++){
        grid.push([]);
        for(let j = 0; j < columns; j++){
            grid[i].push(' ');
        }
    }
    for(let i = 0; i < wordList.length; i++){
        if(!addWord(grid, wordList[i].text, wordList[i].direction, wordList[i].column, wordList[i].row)){
            valid = false;
        }
    }
    return valid ? grid : valid;
}
export {setupGame, getPiecesByProperty, structures, randomizeStructure, checkMatch, createCrossword, Directions};