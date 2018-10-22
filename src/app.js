const css = require('./app.scss');
import 'jquery'

class BoggleBoard {
    constructor(id, board){
        this.id = id
        this.letters = board
    }
}

class Game{
    constructor(score, boggleBoardId, name){
        this.score = score
        this.boggleBoardId = boggleBoardId
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

    this.getBoggleBoard = function (){
        $.getJSON(url, data => {
            service.initBoard(data)

            let name = $('#inputName').val();
            service.startGame(name)
        })
        
    }

    this.getBoggleBoardById = function (id){
        $.getJSON(url, {boardId: id }, data => {
            service.initBoard(data)

            service.startGame(service.game.name)
        })
    }

    this.initBoard = function (data) {
        service.boggleBoard = new BoggleBoard(data.Id, data.Letters)
        service.addLettersToBoard(data.Letters)
        service.updateEvents()
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
        $.getJSON(url + '/IsValidWord', {boardId: service.game.boggleBoardId, 
                                            word: service.currentWord}, isvalidWord => {
            if (!isvalidWord){
                service.clear();
                return
            }

            $.getJSON(url + '/ScoreWord', {word: service.currentWord}, result => {
                let score = parseInt(result)
                if (score > 0){
                    service.game.score += score;
                    $('#scoreTable').append("<tr><td>" + service.currentWord + "</td> <td>" + score + "</td></tr>");
                } 
                service.clear();
            })
            
        })
    }

    this.getHighScores = function () {
        $.getJSON(url + '/GetHighScore', scores => {           
            let highScoreTable = $('#highScoreTable');
            highScoreTable.find("tr:gt(0)").remove();
            console.log(scores)
            for (let g = 0; g < scores.length; g++){
                if(scores[g] === null)
                {
                    continue
                }
                highScoreTable.append("<tr><td>" + scores[g].Name + "</td> <td>" + scores[g].Score + 
                                        "</td> <td><button data-game-id="+ scores[g].BoggleBoardId +" class=playBoardButton>Play this board</button></td></tr>")
            }
            service.clear();
        })
    }

    this.saveGame = function () {
        $.ajax(url, {
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

    this.startGame = function (name) {
        $('#gameField').show();
        endScreen.hide();
        startScreen.hide();
        $('#scoreTable').find("tr:gt(0)").remove();
        service.currentWord = ""
        service.isGameEnd = false;
        service.timerStart = new Date;
        
        boggleService.game = new Game(0, boggleService.boggleBoard.id, name);
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
    }

    setInterval(function() {
        if(service.isGameEnd)
        {
            return
        }
        let time = 180 - Math.floor((new Date - service.timerStart) / 1000);
        if (time < 175)
        {
            service.endGame();
            endScreen.show();
        }
        $('.Timer').text("Timer: " + time);
    }, 1000);
}
const inputName = $('#inputName'),
 startButton = $('#startButton'),
 endScreen = $('#endScreen'),
 startScreen = $('#startScreen')
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
    boggleService.getBoggleBoard()
})

$('#homeButton').on('click', () => {
    endScreen.hide();
    startScreen.show();
})

$('#highScoreTable').on('click', '.playBoardButton', event => {

    let gameId = event.currentTarget.getAttribute('data-game-id');
    boggleService.getBoggleBoardById(gameId)
})

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