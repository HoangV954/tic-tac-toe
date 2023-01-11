let player;
let skynet;
let playerCounter = 0;
let aiCounter = 0;

/* const startBtn = document.querySelector('.start');

startBtn.addEventListener('click', () => {
    console.log(startCounter)
    startCounter += 1;
}) */

// Adjustable - scalable
const boardCols = 3;
const boardRows = 3;

const Player = (name, mark, pos) => {
    const getName = () => name;
    const getMark = () => mark;
    const getPos = () => pos;
    return {getName, getMark, getPos}
}

const gameBoard = (() => {
    const board = document.querySelector('.board');
    const gameArray = [];
    
    const getPlayers = () => {// should move to game flow
        const submitBtn = document.querySelector('.submit');
        const position = document.getElementsByName('order');
        const marks = document.getElementsByName('icon');

        submitBtn.addEventListener('click', () => {
            /* const playerMarkChoice = document.querySelector('input[name="icon"]:checked'); - ALTERNATIVE */
            let playerMarkChoice;
            let aiMarkChoice;
            marks.forEach((mark) => {
                if (mark.checked) {
                    playerMarkChoice = mark;
                } else {
                    aiMarkChoice = mark;
                }
            })
            
            const pMark = document.querySelector(`label[for=${playerMarkChoice.getAttribute('id')}]`).textContent;
            const aiMark = document.querySelector(`label[for=${aiMarkChoice.getAttribute('id')}]`).textContent;

            let playerPosChoice;
            let aiPosChoice;

            position.forEach((pos) => {
                
                if (pos.checked) {
                    playerPosChoice = pos;
                } else {
                    aiPosChoice = pos;
                }
            })

            const pPos = playerPosChoice.getAttribute('value');
            const aiPos = aiPosChoice.getAttribute('value');

            player = Player("You", pMark, pPos);
            skynet = Player("Skynet", aiMark, aiPos);

            if (player.getPos() === "1") {
                playerCounter = 1;
                aiCounter = 2;
                
            } else {
                playerCounter = 2;
                aiCounter = 1;
                // eslint-disable-next-line no-use-before-define
                gameFlow.aiInput();
                /* startBtn.addEventListener('click', gameFlow.aiInput); */
            }
        })
    }

    const createBoard = () => {
        let rowCounter = 1;

            while (rowCounter <= boardCols) {
                for(let c = 1; c <= boardCols; c += 1) {
                    const grid = document.createElement('div');
                    grid.classList.add('grid');
                    grid.setAttribute('data-row', rowCounter);
                    grid.setAttribute('data-col', c);
                    board.appendChild(grid);
                }
                rowCounter += 1;
            }
    }

    return {createBoard, getPlayers, gameArray}
})();

gameBoard.createBoard()
gameBoard.getPlayers()

const gameFlow = (() => {

    
    let winnerCounter = 0;
    let activeMark;
    let winnerMark;
    
    const grids = document.querySelectorAll('.grid');
    const totalGrids = Array.from(grids);
    const groupRows = [];
    const groupCols = [];
    let groupDiagLeft = [];
    let groupDiagRight = [];

    const aiInput = () => {
        const possibleMovesArray = [];

        for (let i = 0; i < totalGrids.length; i+= 1) {
            if (totalGrids[i].textContent === "") {
                possibleMovesArray.push(totalGrids[i]);
            }
        }
        if (possibleMovesArray.length > 0 && winnerCounter === 0) {
            const chosenMove = possibleMovesArray[Math.floor(Math.random()*possibleMovesArray.length)]
            chosenMove.textContent = skynet.getMark()
            gameBoard.gameArray.push(chosenMove.textContent)
            
            checkRows();
            checkCols();
            checkDiag(); 
            findWinner();
        }
        
        playerCounter = 1;
        aiCounter = 2;
    }

    const addUserInput = (e) => {
        
        if (e.target.textContent === "" /* && startCounter === 1 */) {// make sure the target area is not occupied by another symbol
            
            console.log(playerCounter)
            console.log(aiCounter)
            console.log(activeMark)
            if (playerCounter === 1) {
                activeMark = player.getMark();
                
                playerCounter = 2;
                aiCounter = 1;
                e.target.textContent = `${activeMark}`;
                gameBoard.gameArray.push(e.target.textContent)
                aiInput();
                if (winnerCounter === 0) {// making sure winner announcement only fires once
                    checkRows();
                    checkCols();
                    checkDiag(); 
                    findWinner();
                }    
            } 
        }
        
    }

    const getPlayerChoice = () => {
        grids.forEach((grid) => {
            grid.addEventListener('click', addUserInput)
        })
    }

    const getRows = () => {     
        let row = [];
        for (let i = 0; i < totalGrids.length; i += 1) {     

            row.push(totalGrids[i])
            if (row.length === 3) {// simplistic approach applicable to this scenario only, use the formula for getCols for scalable code
                groupRows.push(row);
                row = [];
            }        
        }  
    }

    const checkRows = () => {
        getRows();
        for (let i = 0; i < groupRows.length; i+= 1) {
            for (let j = 0; j < groupRows[i].length; j += 1) {
                if (groupRows[i][j + 2]) {
                    if (groupRows[i][j].textContent !== "" && groupRows[i][j].textContent === groupRows[i][j+1].textContent && groupRows[i][j].textContent === groupRows[i][j+2].textContent) {
                        console.log("we have a winner!")
                        winnerCounter = 1;
                        winnerMark = groupRows[i][j];
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    const getCols = () => {
        let n = 0;
        while (n < boardRows) { // Finding the number of ENTIRE columns in the board
            groupCols.push([]);
            n += 1;
        }

        for (let i = 0; i < totalGrids.length; i += 1) {
            if (totalGrids[i + groupCols.length*2]) {// 2 is the consecutive number that you need to win (minus the first one). Also to limit out of bound situations
                const numCol = totalGrids[i].getAttribute('data-col');
                
                if (numCol === totalGrids[i + 3].getAttribute('data-col') && numCol === totalGrids[i + groupCols.length*2].getAttribute('data-col')) {// 3 is groupCols.length. This can be translated into [i + x*2] && [i+x*4] in a bigger board and different criteria 
                    groupCols[numCol-1].push(totalGrids[i], totalGrids[i + 3], totalGrids[i + 6])
                }
            }
        }

    }

    const checkCols = () => {
        getCols();
        for (let i = 0; i < groupCols.length; i+= 1) {
            for (let j = 0; j < groupCols[i].length; j += 1) {
                if (groupCols[i][j + 2]) {
                    if (groupCols[i][j].textContent !== "" && groupCols[i][j].textContent === groupCols[i][j+1].textContent && groupCols[i][j].textContent === groupCols[i][j+2].textContent) {
                        console.log("we have a winner!")
                        winnerCounter = 1;
                        winnerMark = groupCols[i][j];
                        return true;
                    }
                }
            }
        }
        return false;
    }

    const getDiagLeft = () => {
        const diagColLeft = [];
        const diagRowLeft = [];// minus the one for col

        // find Diag line from col   
        for (let i = 0; i < totalGrids.length; i += 1) {
            if (totalGrids[i + boardCols] && totalGrids[i].getAttribute('data-col') === "1") {// check if there's another grid below the current one (col) - make the base array
                diagColLeft.push([totalGrids[i]]);  
            } 
        }

        for (let l = 0; l < diagColLeft.length; l += 1) {
            for (let i = 0; i < totalGrids.length; i += 1) {
                const reference = diagColLeft[l][diagColLeft[l].length - 1]
                            
                if (Number(totalGrids[i].getAttribute('data-col')) - 1 === Number(reference.getAttribute('data-col')) && Number(totalGrids[i].getAttribute('data-row')) - 1 === Number(reference.getAttribute('data-row'))) { // col + 1, row + 1 = diagonal
                    diagColLeft[l].push(totalGrids[i])
                } 
            }
        }

        // find Diag line from row
        for (let i = 0; i < totalGrids.length; i += 1) {
            if (i!==0 && totalGrids[i + boardCols + 1] && totalGrids[i].getAttribute('data-row') === "1") {// improvement: +1 because it means a diagonal relative exists
                diagRowLeft.push([totalGrids[i]]);        
            }
        }

        for (let c = 0; c < diagRowLeft.length; c += 1) {
            for (let i = 0; i < totalGrids.length; i += 1) {
                const reference = diagRowLeft[c][diagRowLeft[c].length - 1]
                
                if (Number(totalGrids[i].getAttribute('data-col')) - 1 === Number(reference.getAttribute('data-col')) && Number(totalGrids[i].getAttribute('data-row')) - 1 === Number(reference.getAttribute('data-row'))) { // col + 1, row + 1 = diagonal
                    diagRowLeft[c].push(totalGrids[i])
                } 
            }
        }
        groupDiagLeft.push(...diagColLeft, ...diagRowLeft);
        groupDiagLeft = groupDiagLeft.filter((el) => el.length >= boardCols);
    }

    const getDiagRight = () => {
        
        for (let i = 0; i < totalGrids.length; i += 1) {
            if (totalGrids[i + boardCols] && (totalGrids[i].getAttribute('data-col') === "3" || totalGrids[i].getAttribute('data-row') === "1") && i!==0) {// faster than the above method to get diag left
                groupDiagRight.push([totalGrids[i]]);  
            } 
        }

        for (let j = 0; j < groupDiagRight.length; j += 1) {
            for (let i = 0; i < totalGrids.length; i += 1) {
                const reference = groupDiagRight[j][groupDiagRight[j].length - 1]
                
                if (Number(totalGrids[i].getAttribute('data-col')) + 1 === Number(reference.getAttribute('data-col')) && Number(totalGrids[i].getAttribute('data-row')) - 1 === Number(reference.getAttribute('data-row'))) { // col + 1, row - 1 = diagonal. Difference in row method due to reversed position
                    groupDiagRight[j].push(totalGrids[i])
                } 
            }
        }
        
        groupDiagRight = groupDiagRight.filter((el) => el.length >= boardCols);
    }

    const checkDiag = () => {
        getDiagLeft();
        getDiagRight();
        const totalDiag = groupDiagLeft.concat(groupDiagRight);

        for (let i = 0; i < totalDiag.length; i+= 1) {
            for (let j = 0; j < totalDiag[i].length; j += 1) {
                if (totalDiag[i][j + 2]) {
                    if (totalDiag[i][j].textContent !== "" && totalDiag[i][j].textContent === totalDiag[i][j+1].textContent && totalDiag[i][j].textContent === totalDiag[i][j+2].textContent) {
                        console.log("we have a winner!")
                        
                        winnerCounter = 1;
                        winnerMark = totalDiag[i][j];
                        return true;
                    }
                }
            }
        }
        return false;
    }

    const resetBoard = () => {
        grids.forEach((grid) => {
            // eslint-disable-next-line no-param-reassign
            grid.textContent = "";
        })
        gameBoard.gameArray = [];
        startCounter = 0;
        startBtn.removeEventListener('click', gameFlow.aiInput);
        playerCounter = 0;
        aiCounter = 1;
        winnerCounter = 0;
        getPlayerChoice();
    }

    const findWinner = () => {
        if (winnerCounter === 1) {
            console.log(winnerMark)
            if (winnerMark.textContent === player.getMark()) {
                console.log("playa play on")
            } else {
                console.log("skynet domination")
            }
            grids.forEach((grid) => {
                grid.removeEventListener('click', addUserInput)
            })
        } else if (winnerCounter === 0 && gameBoard.gameArray.length === 9) {
            console.log("draw")
        }
    }
    
    return {getPlayerChoice, checkRows, checkCols, checkDiag, findWinner, addUserInput, aiInput}

})();

gameFlow.getPlayerChoice();



/* -------------------------------------------------------------------------- */
/*                                Test       section 
/* -------------------------------------------------------------------------- */
function test() {
    /* console.log(player1.getName())
    console.log(player2.getName()) */
    console.log(gameBoard.gameArray)
    
}

const testShit = document.querySelector('.test')
testShit.addEventListener('click', test)



    

    