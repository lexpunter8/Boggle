const css = require('./app.scss');
import 'jquery'

class Game{
    constructor(score, board, name){
        this.score = score
        this.board = board
        this.name = name
    }
}

var inputName = $('#inputName'),
 startButton = $('#startButton'),
 endScreen = $('#endScreen'),
 startScreen = $('#startScreen'),
 games = [];

$(document).ready(() => {
    inputName.focus();
})

var dice = [
    ['R', 'I', 'F', 'O', 'B', 'X'],
    ['I', 'F', 'E', 'H', 'E', 'Y'],
    ['D', 'E', 'N', 'O', 'W', 'S'],
    ['U', 'T', 'O', 'K', 'N', 'D'],
    ['H', 'M', 'S', 'R', 'A', 'O'],
    ['L', 'U', 'P', 'E', 'T', 'S'],
    ['A', 'C', 'I', 'T', 'O', 'A'],
    ['Y', 'L', 'G', 'K', 'U', 'E'],
    ['Q', 'B', 'M', 'J', 'O', 'A'],
    ['E', 'H', 'I', 'S', 'P', 'N'],
    ['V', 'E', 'T', 'I', 'G', 'N'],
    ['B', 'A', 'L', 'I', 'Y', 'T'],
    ['E', 'Z', 'A', 'V', 'N', 'D'],
    ['R', 'A', 'L', 'E', 'S', 'C'],
    ['U', 'W', 'I', 'L', 'R', 'G'],
    ['P', 'A', 'C', 'E', 'M', 'D']
];

var letters = $('.boggle'),
 word = "", game, isGameEnd, timerStart;
const board = $('#board');

function acsendingSort(a, b)
    {
        // if they are equal, return 0 (no sorting)
        if (a.score == b.score) { return 0; }
        // return 1 if b is greater than a else return 0
        return a.score < b.score ? 1 : 0;
    }

function addLetter(letter){
    $('.wordBlock').append(letter);
    console.log(letter);
    word += letter;
}

function clear() {
    for (let i = 0; i < letters.length; i++) {
        let current = $(letters[i]);
            current.removeClass('disabled selected');
    }
    $('.wordBlock').empty();
    word = "";
}

function updateBoard(col, row){
    for (let i = 0; i < letters.length; i++) {
        let current = $(letters[i]);
        if (!current.hasClass('selected'))
        {   
            current.addClass('disabled');
        }
    }
    for (let rowDelta = -1; rowDelta < 2; rowDelta++){
        let borderRow = row + rowDelta;
        if (borderRow > 3 || borderRow < 0)
        {
            continue
        }
        for (let colDelta = -1; colDelta < 2; colDelta++){
            let borderCol = col + colDelta
            if (borderCol > 3 || borderCol < 0)
            {
                continue;
            }
            let index = (4 * borderRow) + borderCol;
            $(letters[index]).removeClass('disabled')
            if (index === (4 * row) + col){
               $(letters[index]).addClass('selected'); 
            }
            
        }
    }
}

function create(name = "", customBoard) {
    timerStart = new Date;
    $('#gameField').show();
    endScreen.hide();
    startScreen.hide();
    $('#scoreTable').find("tr:gt(0)").remove();

    board.empty();
    game = new Game(0, [], name);
    for (let row = 0; row < 4; row++){
        board.append("<tr>");
        for (let col = 0; col < 4; col++)
        {
            // get the dice number to use
            let diceNumber = (row * 4) + col;
            let letter = ''
            if (typeof customBoard === 'undefined'){

                // get a random number between 0 - 6 form the letter on the dice
                let diceLetter = Math.floor(Math.random() * 6)
                letter = dice[diceNumber][diceLetter];
            } else {
                letter = customBoard[diceNumber]
            }

            game.board.push(letter);
            board.append("<td data-col-index=" + col + " data-row-index=" + row + " class=boggle>" + letter + "</td>");

        }
        board.append("</tr>");
        isGameEnd = false;
    }
    letters = $('.boggle');

    $(letters).on('click', event => {
        let current = $(event.currentTarget);
        if(current.hasClass('selected') || current.hasClass('disabled'))
        { 
            return;
        }
        addLetter(current.text());
        let row = parseInt(event.currentTarget.getAttribute('data-row-index'));
        let col = parseInt(event.currentTarget.getAttribute('data-col-index'));
        updateBoard(col, row)
    })
}

function endGame(){
    $('#gameField').hide();
    isGameEnd = true;
    games.push(game);
    games.sort(acsendingSort);
    $('#score').text('Score: ' + game.score);
    let highScoreTable = $('#highScoreTable');
    highScoreTable.find("tr:gt(0)").remove();
    for (let g = 0; g < games.length; g++){
        highScoreTable.append("<tr><td>" + games[g].name + "</td> <td>" + games[g].score + 
                                "</td> <td><button data-game-index="+g+" class=playBoardButton>Play this board</button></td></tr>")
    }
    clear();
}

function calcWordScore(word){
    let length = String(word).length;
    switch(length){
        case 3:
        return 1;
        case 4:
        return 1;
        case 5:
        return 2;
        case 6:
        return 3;
        case 7:
        return 5
    }
    if (length > 7)
    {
        return 11;
    }
}

$('#addWordButton').on('click', () => {
    if (String(word).length < 3)
    {
        return;
    }
    let score = calcWordScore(word);
    game.score += score;
    $('#scoreTable').append("<tr><td>" + word + "</td> <td>" + score + "</td></tr>");
    clear();
})

$('#clearButton').on('click', () =>{
    clear();
})

$('#startButton').on('click', () =>{
    let name = $('#inputName').val();
    create(name);
})

$('#highScoreTable').on('click', '.playBoardButton', event => {
    console.log('play borad')
    let gameIndex = parseInt(event.currentTarget.getAttribute('data-game-index'));
    create(game.name, games[gameIndex].board);
})

setInterval(function() {
    if(isGameEnd)
    {
        return
    }
    let time = 180 - Math.floor((new Date - timerStart) / 1000);
    if (time < 175)
    {
        endGame();
        $('#endScreen').show();
    }
    $('.Timer').text("Timer: " + time);
}, 1000);

inputName.on('input', () => {
    if (inputName.val().length > 0)
    {
        startButton.prop('disabled', false);
    }
    if (!inputName.val().length > 0)
    {
        startButton.prop('disabled', true);
    }
})

$('#homeButton').on('click', () => {
    endScreen.hide();
    startScreen.show();
})