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

var inputName = $('#inputName'),
 startButton = $('#startButton'),
 endScreen = $('#endScreen'),
 startScreen = $('#startScreen'),
 games = [];
$(document).ready(() => {
    inputName.focus();
})

var letters = $('.boggle'),
 word = "", game, isGameEnd, timerStart;
const board = $('#board');

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

function create(name = "", boggleBoard) {
    console.log(boggleBoard)
    timerStart = new Date;
    $('#gameField').show();
    endScreen.hide();
    startScreen.hide();
    $('#scoreTable').find("tr:gt(0)").remove();
    board.empty();
        isGameEnd = false;

    game = new Game(0, boggleBoard.id, name);
    for (let row = 0; row < 4; row++){
        board.append("<tr>");
        for (let col = 0; col < 4; col++)
        {
            let letter = boggleBoard.letters[row][col]
            board.append("<td data-col-index=" + col + " data-row-index=" + row + " class=boggle>" + letter + "</td>");
        }
        board.append("</tr>");
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

    console.log(JSON.stringify(game))
    $.ajax({
        url : '/api/Boggle',
        type : 'POST',
        contentType: 'application/json',
        data: JSON.stringify(game)
    });


    $.ajax({

        url : '/api/Boggle/GetHighScore',
        type : 'GET',
        dataType: 'json',
        success : function(data) {  
            console.log(data)            
            games = data
            console.log(games)

            $('#score').text('Score: ' + game.score);
            let highScoreTable = $('#highScoreTable');
            highScoreTable.find("tr:gt(0)").remove();
            for (let g = 0; g < games.length; g++){
                highScoreTable.append("<tr><td>" + games[g].Name + "</td> <td>" + games[g].Score + 
                                        "</td> <td><button data-game-index="+ games[g].BoggleBoardId +" class=playBoardButton>Play this board</button></td></tr>")
            }
            clear();
    },
    error : function(request,error)
    {
        alert("Request: "+JSON.stringify(error));
    }
});

}

$('#addWordButton').on('click', () => {
    if (String(word).length < 3)
    {
        return;
    }

    
    $.ajax({

        url : '/api/Boggle/ScoreWord',
        type : 'GET',
        dataType: 'json',
        data: {
            word: word
        },
        success : function(data) {    
            let score = parseInt(data)
            if (score > 0){
                game.score += score;
                $('#scoreTable').append("<tr><td>" + word + "</td> <td>" + score + "</td></tr>");
                clear();
            }         
        },
        error : function(request,error)
        {
            alert("Request: "+JSON.stringify(error));
        }
    });
})

$('#clearButton').on('click', () =>{
    clear();
})

startButton.on('click', () =>{
    let name = $('#inputName').val();

    $.getJSON('/api/Boggle', data => {
        create(name, new BoggleBoard(data.Id, data.Letters));
    })

    // $.ajax({

    //     url : '/api/Boggle/',
    //     type : 'GET',
    //     dataType: 'json',
    //     success : function(data) {  
    //         console.log(data.Letters)
    //         //return new BoggleBoard(data.Id, data.Letters)
    //     },
    //     error : function(request,error)
    //     {
    //         alert("Request: "+JSON.stringify(error));
    //     }
    // });
    // create(name, getBoard())
})

$('#highScoreTable').on('click', '.playBoardButton', event => {

    let gameIndex = event.currentTarget.getAttribute('data-game-index');
    console.log(gameIndex)
    $.ajax({

        url : '/api/Boggle/GetBoggleBoardById',
        type : 'GET',
        dataType: 'json',
        data: {
            boardId: gameIndex
        },
        success : function(data) {  
            console.log(data.Letters)
            create(name, new BoggleBoard(data.Id, data.Letters));
        },
        error : function(request,error)
        {
            alert("Request: "+JSON.stringify(error));
        }
    });
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

function getBoard()
{
    $.ajax({

        url : '/api/Boggle/',
        type : 'GET',
        dataType: 'json',
        async: 'false',
        success : function(data) {  
            console.log(data.Letters)
            //return new BoggleBoard(data.Id, data.Letters)
            create(name, boggleBoard);
        },
        error : function(request,error)
        {
            alert("Request: "+JSON.stringify(error));
        }
    });
}


// $.ajax({

//     url : '/api/Boggle',
//     type : 'GET',
//     dataType: 'json',
//     success : function(data) {              
//         alert('Data: '+ data);
//     },
//     error : function(request,error)
//     {
//         alert("Request: "+JSON.stringify(error));
//     }
// });
