
const dimensions = {rows: 7, columns: 7};

const pieces = {
    singles: [
        [[1]]
    ],
    diags: [
        [[1, 0],[0, 1]],
        [[0, 1],[1, 0]]
    ],
    corner4: [
        [[1, 1],[0, 1]],
        [[0, 1],[1, 1]],
        [[1, 0],[1, 1]],
        [[1, 1],[1, 0]]
    ],
    corner6: [
        [[1, 1, 1], [1, 0, 0]],
        [[1, 1], [0, 1], [0, 1]],
        [[0, 0, 1], [1, 1, 1]],
        [[1, 0], [1, 0], [1, 1]]
    ],
    line: [
        [[1, 1, 1, 1]],
        [[1], [1], [1], [1]]
    ]
}

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
function setupGame(){
    let structure = [];
    for(var i = 0; i < dimensions.rows; i++){
        createRow(structure);
    }
    return structure;
}
function removeRow(structure, targetRow){
    structure.splice(targetRow, 1);
    createRow(structure, targetRow, true);
}
function executeRowRemovals(structure, rows){
    for(let i = 0; i < rows.length; i++){
        removeRow(structure, rows[i]);
    }
}
function remove3x3Blocks(structure){
    let blockGroup = [];
    for(let i = 0; i < structure.length - 2; i++){
        let blockFound = [];
        for(let j = 0; j < structure[i].length - 2; j++){
            const pattern = structure[i].join('').substr(j,3) + structure[i+1].join('').substr(j,3) + structure[i+2].join('').substr(j,3);
            
            if(pattern == '111111111'){
                structure[i][j] = 0;
                structure[i][j+1] = 0;
                structure[i][j+2] = 0;
                structure[i+1][j] = 0;
                structure[i+1][j+1] = 0;
                structure[i+1][j+2] = 0;
                structure[i+2][j] = 0;
                structure[i+2][j+1] = 0;
                structure[i+2][j+2] = 0;
                blockFound.push([i,j]);
                blockFound.push([i,j+1]);
                blockFound.push([i,j+2]);
                blockFound.push([i+1,j]);
                blockFound.push([i+1,j+1]);
                blockFound.push([i+1,j+2]);
                blockFound.push([i+2,j]);
                blockFound.push([i+2,j+1]);
                blockFound.push([i+2,j+2]);
            }
        }
        if(blockFound.length > 0){
            blockGroup.push(blockFound);
        }
    }
    return blockGroup;
}
function rowCheck(structure, row, slots, offset){
    let maxFill = offset + slots.length;
    if(maxFill > dimensions.columns){
        return false;
    }
    let newRow = structure[row].join('').split('');
    for(let i = offset; i < slots.length + offset; i++){
        if(newRow[i].toString() == '1' && slots[i - offset].toString() == '1'){
            return false;
        }
        else if (slots[i - offset].toString() == '1'){
            newRow[i] = slots[i - offset];
        }
        
    }
    return newRow;
}
function checkForRemoval(structure){
    let removedRows = [];
    for(let i = 0; i < structure.length; i++){
        let copy = structure[i].join('').split('');
        var sum = copy.reduce(function(a, b){
            return Number(a) + Number(b);
        }, 0);
        if(sum == dimensions.columns){
            // removeRow(structure, i);
            removedRows.push(i);
        }
    }
    return removedRows;
}
function dropPiece(structure, pieceRows, row, column){
    let checks = []
    if(pieceRows.length + row > structure.length){
        return false;
    }
    for(let i = 0; i < pieceRows.length; i++){
        const check = rowCheck(structure, row + i, pieceRows[i], column);
        if(check){
            checks.push(check);
        }
        else{
            return false
        }
    }
    for(let i = 0; i < checks.length; i++){
        structure[row + i] = checks[i];
    }
    const removedRows = checkForRemoval(structure);
    const remobedSquares = remove3x3Blocks(structure);
    executeRowRemovals(structure,removedRows);
    return {structure: structure, rowsRemoved: removedRows, otherRemovals: remobedSquares};
}
function getPiece(){
    let allPieces = [];
    for(let pieceGroup in pieces){
        for(let i = 0; i < pieces[pieceGroup].length; i++){
            allPieces.push(pieces[pieceGroup][i]);
        }
    }
    console.log(allPieces[Math.floor(Math.random() * allPieces.length)]);
    return allPieces[Math.floor(Math.random() * allPieces.length)];
}
export {setupGame, pieces, dropPiece, getPiece};