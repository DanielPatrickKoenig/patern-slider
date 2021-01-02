function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
function reshape(list, size){
    let reshapedStucture = [];
    let colIndex = 0;
    for(var i = 0; i < list.length; i++){
        if(colIndex == 0){
            reshapedStucture.push([]);
        }
        reshapedStucture[reshapedStucture.length-1].push(list[i]);
        colIndex++;
        if(colIndex >= size){
            colIndex = 0;
        }
    }
    return reshapedStucture;
}
export {shuffle, reshape};