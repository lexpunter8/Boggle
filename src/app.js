const css = require('./app.scss');
import 'jquery'

class BoggleBoard {
    constructor(id, board){
        this.id = id
        this.letters = board
    }
}

class Game{
    constructor(id, name){
        this.id = id
        this.score = 0
        this.name = name
    }
}

function BoggleService(url){
    var service = this
    this.board = $('#board');
    this.game
    this.boggleBoard
    this.letters = $('.boggle')
    this.isGameEnd = true

    this.updateEvents = function () {
        $(service.letters).on('click', event => {
            let current = $(event.currentTarget);
            if(current.hasClass('selected') || current.hasClass('disabled'))
            { 
                return;
            }
            service.addLetter(current.text());
            let row = parseInt(event.currentTarget.getAttribute('data-row-index'));
            let col = parseInt(event.currentTarget.getAttribute('data-col-index'));
            service.updateBoard(col, row)
        })
    }

    this.createGame = function (){
        let name = nameInpuBox.val();
        $.getJSON(url, {name: name}, gameId => {
            service.game = new Game(gameId, name)
            service.initBoard(gameId)
        })
    }

    this.createGameByBoardId = function (boardId){
        let name = nameInpuBox.val();
        $.getJSON(url + '/GetGameByBoardId', {name: name, boardId: boardId }, gameId => {
            service.game = new Game(gameId, name)
            service.initBoard(gameId)
        })
    }

    this.initBoard = function (gameId) {
        $.getJSON(url + '/GetBoggleBoardByGameId', {gameId: gameId}, boggleBoard => {
    
            service.boggleBoard = new BoggleBoard(boggleBoard.Id, boggleBoard.Letters)
            console.log(service.boggleBoard)
            service.addLettersToBoard(boggleBoard.Letters)
            service.updateEvents()
            service.startGame()

        })
    }

    this.addLettersToBoard = function (letters){
        service.board.empty()
        for (let row = 0; row < 4; row++){
            service.board.append("<tr>");
            for (let col = 0; col < 4; col++)
            {
                let letter = letters[row][col]
                service.board.append("<td data-col-index=" + col + " data-row-index=" + row + " class=boggle>" + letter + "</td>");
            }
            service.board.append("</tr>");
        }
        service.letters = $('.boggle')
    }

    this.getScoreWord = function (){
        $.getJSON(url + '/IsValidWord', {gameId: service.game.id, 
                                            word: service.currentWord}, isvalidWord => {
                                         console.log(service.currentWord)       
            console.log(isvalidWord)
            if (!isvalidWord){
                service.clear();
                $('#errorBox').text('Not valid!')
                return
            }
            $('#errorBox').text('')
            $.getJSON(url + '/ScoreWord', {word: service.currentWord}, result => {
                let score = parseInt(result)
                if (score > 0){
                    service.game.score += score;
                    console.log(service.game.score)
                    $('#scoreTable').append("<tr><td>" + service.currentWord + "</td> <td>" + score + "</td></tr>");
                } 
                service.clear();
            })
            
        })
    }

    this.getHighScores = function () {
        $.getJSON(url + '/GetHighScore', {count: 10}, scores => {           
            let highScoreTable = $('#highScoreTable');
            highScoreTable.find("tr:gt(0)").remove();
            for (let g = 0; g < scores.length; g++){
                if(scores[g] === null)
                {
                    continue
                }
                highScoreTable.append("<tr><td>"+ (g + 1) +"</td><td>" + scores[g].Name + "</td> <td>" + scores[g].Score + 
                                        "</td> <td><button data-game-id="+ scores[g].BoggleBoardId +" class=playBoardButton>Play this board</button></td></tr>")
            }
            service.clear();
        })
    }

    this.saveGame = function () {

        console.log(service.game)
        $.ajax({
            url: url + '/SaveGame',
            type: 'post',
            data: service.game,
            success: function(){
                service.getHighScores()
            }
        }).fail(function (jqXHR, textStatus, errorThrown){
            alert('error')
        })
    }

    this.addLetter = function (letter){
        $('.wordBlock').append(letter);
        service.currentWord += letter;
    }

    this.updateBoard = function (col, row){
        for (let i = 0; i < service.letters.length; i++) {
            let current = $(service.letters[i]);
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
                $(service.letters[index]).removeClass('disabled')
                if (index === (4 * row) + col){
                   $(service.letters[index]).addClass('selected'); 
                }
                
            }
        }
    }

    this.startGame = function () {
        $('#gameField').show();
        endScreen.hide();
        startScreen.hide();
        $('#scoreTable').find("tr:gt(0)").remove();
        service.currentWord = ""
        service.isGameEnd = false;
        service.timerStart = new Date;
    }

    this.clear = function (){
        for (let i = 0; i < service.letters.length; i++) {
            let current = $(service.letters[i]);
                current.removeClass('disabled selected');
        }
        $('.wordBlock').empty();
        service.currentWord = "";
    }
    
    this.endGame = function (){
        $('#gameField').hide();
        service.isGameEnd = true;
        service.saveGame()
        $('#score').text('Your score: ' + service.game.score)
        endScreen.show();
    }

    setInterval(function() {
        if(service.isGameEnd)
        {
            return
        }
        let time = 180 - Math.floor((new Date - service.timerStart) / 1000);
        if (time < 1)
        {
            service.endGame();
        }
        $('.Timer').text("Timer: " + time);
    }, 1000);
}
const inputName = $('#inputName'),
 startButton = $('#startButton'),
 endScreen = $('#endScreen'),
 startScreen = $('#startScreen'),
 highScoreButton = $('#highScoreButton'),
 nameInpuBox = $('#inputName')
var boggleService

$(document).ready(() => {
    boggleService = new BoggleService('/api/Boggle')

    inputName.focus();
})

$('#addWordButton').on('click', () => {
    boggleService.getScoreWord()
})

$('#clearButton').on('click', () =>{
    boggleService.clear();
})

startButton.on('click', () =>{
    boggleService.createGame()
})

$('#homeButton').on('click', () => {
    endScreen.hide();
    startScreen.show();
})

$('#highScoreTable').on('click', '.playBoardButton', event => {

    let gameId = event.currentTarget.getAttribute('data-game-id');
    boggleService.createGameByBoardId(gameId)
})

inputName.on('input', () => {
    if (inputName.val().length > 0)
    {
        startButton.prop('disabled', false)
        highScoreButton.prop('disabled', false)
    }
    if (!inputName.val().length > 0)
    {
        startButton.prop('disabled', true)
        highScoreButton.prop('disabled', true)
    }
})

$('#homeButton').on('click', () => {
    endScreen.hide();
    startScreen.show();
})

highScoreButton.on('click', () => {
    startScreen.hide()
    endScreen.show()
    boggleService.getHighScores()
})