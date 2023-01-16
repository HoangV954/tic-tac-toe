/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
let player;
let skynet;
let playerCounter = 0;
let aiCounter = 0;
let aiMove;
const startBtn = document.querySelector('.start');
const rematchBtn = document.querySelector('.rematch');
const resetBtn = document.querySelector('.reset');
const submitBtn = document.querySelector('.submit');
const endgame = document.querySelector('.modal.endgame-choices');
const playerSymbol = document.querySelector('.player1-info');
const aiSymbol = document.querySelector('.player2-info');

// Adjustable - scalable
const boardCols = 3;
const boardRows = 3;

const Player = (name, mark, pos) => {
    const getName = () => name;
    const getMark = () => mark;
    const getPos = () => pos;
    return { getName, getMark, getPos }
}

const gameBoard = (() => {
    const board = document.querySelector('.board');
    const gameArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const level = document.querySelector('select');


    const getPlayers = () => {// should move to game flow

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

            const pMark = document.querySelector(`label[for=${playerMarkChoice.getAttribute('id')}]`).getElementsByTagName('img')[0];
            const aiMark = document.querySelector(`label[for=${aiMarkChoice.getAttribute('id')}]`).getElementsByTagName('img')[0];

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

                if (level.value === "windows") {
                    startBtn.addEventListener('click', gameFlow.aiInput);

                } else {
                    startBtn.addEventListener('click', gameFlow.impAiInput);

                }
            }
            startBtn.addEventListener('click', () => {
                playerSymbol.appendChild(player.getMark().cloneNode(true))
                aiSymbol.appendChild(skynet.getMark().cloneNode(true))
            })
        })
    }

    const createBoard = () => {
        let rowCounter = 1;
        let id = 0;

        while (rowCounter <= boardCols) {
            for (let c = 1; c <= boardCols; c += 1) {
                const grid = document.createElement('div');
                grid.classList.add('grid');
                grid.setAttribute('data-row', rowCounter);
                grid.setAttribute('data-col', c);
                grid.setAttribute('id', `${id}`)
                board.appendChild(grid);
                id += 1;
            }
            rowCounter += 1;
        }
    }

    return { createBoard, getPlayers, gameArray, level }
})();

gameBoard.createBoard();
gameBoard.getPlayers();

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
        if (aiCounter === 1) {

            const possibleMovesArray = [];

            for (let i = 0; i < totalGrids.length; i += 1) {
                if (!totalGrids[i].hasChildNodes()) {
                    possibleMovesArray.push(totalGrids[i]);
                }
            }


            if (possibleMovesArray.length > 0 && winnerCounter === 0) {
                const chosenMove = possibleMovesArray[Math.floor(Math.random() * possibleMovesArray.length)]
                activeMark = skynet.getMark();
                chosenMove.appendChild(activeMark.cloneNode(true));
                for (let i = 0; i < gameBoard.gameArray.length; i += 1) {
                    if (Number(chosenMove.getAttribute('id')) === i) {
                        gameBoard.gameArray[i] = activeMark.getAttribute('id');
                    }
                }

                checkRows();
                checkCols();
                checkDiag();
                findWinner();
            }

            playerCounter = 1;
            aiCounter = 2;
        }

    }

    const impAiInput = () => {
        if (winnerCounter === 0 && !gameBoard.gameArray.every(a => a === "x" || a === "o")) {
            activeMark = skynet.getMark()/* .getAttribute('id') */
            highLevelAi.minimax(gameBoard.gameArray, skynet.getMark().getAttribute('id'))
            if (!aiMove.hasChildNodes()) {
                aiMove.appendChild(skynet.getMark().cloneNode(true));
            }
            gameBoard.gameArray[aiMove.getAttribute('id')] = activeMark.getAttribute('id');
        }
        checkRows();
        checkCols();
        checkDiag();
        findWinner();
    }

    const addUserInput = (e) => {

        if (e !== undefined) {
            if (!e.currentTarget.hasChildNodes()) {// make sure the target area is not occupied by another symbol. USING currentTarget is much better than target if the child is positioned right on top of parent

                if (playerCounter === 1) {
                    activeMark = player.getMark();

                    playerCounter = 2;
                    aiCounter = 1;
                    e.currentTarget.appendChild(activeMark.cloneNode(true))
                    for (let i = 0; i < gameBoard.gameArray.length; i += 1) {
                        if (Number(e.currentTarget.getAttribute('id')) === i) {
                            gameBoard.gameArray[i] = activeMark.getAttribute('id');
                        }
                    }
                    checkRows();
                    checkCols();
                    checkDiag();
                    findWinner();

                    if (winnerCounter === 0 && !gameBoard.gameArray.every(a => a === "x" || a === "o")) {// making sure winner announcement only fires once
                        if (gameBoard.level.value === "windows") {
                            aiInput();

                        } else if (gameBoard.level.value === "skynet") {
                            impAiInput()

                        }
                    }

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
        for (let i = 0; i < groupRows.length; i += 1) {
            for (let j = 0; j < groupRows[i].length; j += 1) {
                if (groupRows[i][j + 2]) {
                    const test = document.getElementById(`${activeMark.getAttribute('id')}`)
                    const test2 = groupRows[i][j].querySelector(`#${activeMark.getAttribute('id')}`)
                    const test3 = groupRows[i][j + 1].querySelector(`#${activeMark.getAttribute('id')}`)
                    const test4 = groupRows[i][j + 2].querySelector(`#${activeMark.getAttribute('id')}`)



                    if (test2 && test.isEqualNode(test2) && test.isEqualNode(test3) && test.isEqualNode(test4)) {

                        winnerCounter = 1;
                        winnerMark = test.getAttribute('id');
                        setTimeout(() => {
                            test2.parentNode.classList.add('shake');
                            test3.parentNode.classList.add('shake');
                            test4.parentNode.classList.add('shake');
                        }, 3000)
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
            if (totalGrids[i + groupCols.length * 2]) {// 2 is the consecutive number that you need to win (minus the first one). Also to limit out of bound situations
                const numCol = totalGrids[i].getAttribute('data-col');

                if (numCol === totalGrids[i + 3].getAttribute('data-col') && numCol === totalGrids[i + groupCols.length * 2].getAttribute('data-col')) {// 3 is groupCols.length. This can be translated into [i + x*2] && [i+x*4] in a bigger board and different criteria 
                    groupCols[numCol - 1].push(totalGrids[i], totalGrids[i + 3], totalGrids[i + 6])
                }
            }
        }

    }

    const checkCols = () => {
        getCols();
        for (let i = 0; i < groupCols.length; i += 1) {
            for (let j = 0; j < groupCols[i].length; j += 1) {
                if (groupCols[i][j + 2]) {
                    const test = document.getElementById(`${activeMark.getAttribute('id')}`)
                    const test2 = groupCols[i][j].querySelector(`#${activeMark.getAttribute('id')}`)
                    const test3 = groupCols[i][j + 1].querySelector(`#${activeMark.getAttribute('id')}`)
                    const test4 = groupCols[i][j + 2].querySelector(`#${activeMark.getAttribute('id')}`)

                    if (test2 && test.isEqualNode(test2) && test.isEqualNode(test3) && test.isEqualNode(test4)) {

                        winnerCounter = 1;
                        winnerMark = test.getAttribute('id');
                        setTimeout(() => {
                            test2.parentNode.classList.add('shake');
                            test3.parentNode.classList.add('shake');
                            test4.parentNode.classList.add('shake');
                        }, 3000)

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
            if (i !== 0 && totalGrids[i + boardCols + 1] && totalGrids[i].getAttribute('data-row') === "1") {// improvement: +1 because it means a diagonal relative exists
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
            if (totalGrids[i + boardCols] && (totalGrids[i].getAttribute('data-col') === "3" || totalGrids[i].getAttribute('data-row') === "1") && i !== 0) {// faster than the above method to get diag left
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

        for (let i = 0; i < totalDiag.length; i += 1) {
            for (let j = 0; j < totalDiag[i].length; j += 1) {
                if (totalDiag[i][j + 2]) {
                    const test = document.getElementById(`${activeMark.getAttribute('id')}`)
                    const test2 = totalDiag[i][j].querySelector(`#${activeMark.getAttribute('id')}`)
                    const test3 = totalDiag[i][j + 1].querySelector(`#${activeMark.getAttribute('id')}`)
                    const test4 = totalDiag[i][j + 2].querySelector(`#${activeMark.getAttribute('id')}`)

                    if (test2 && test.isEqualNode(test2) && test.isEqualNode(test3) && test.isEqualNode(test4)) {

                        winnerCounter = 1;
                        winnerMark = test.getAttribute('id');
                        setTimeout(() => {
                            test2.parentNode.classList.add('shake');
                            test3.parentNode.classList.add('shake');
                            test4.parentNode.classList.add('shake');
                        }, 3000)

                        return true;
                    }
                }
            }
        }
        return false;
    }

    const rematch = () => {
        winnerCounter = 0;
        gameBoard.gameArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        const aiGif = document.querySelector('.modal.ai-win');
        aiGif.style.display = 'none';
        grids.forEach((grid) => {
            if (grid.hasChildNodes()) {
                grid.removeChild(grid.children[0]);
            }
            grid.classList.remove('shake');

        })


        if (player.getPos() === "1") {
            playerCounter = 1;
            aiCounter = 2;

        } else {
            playerCounter = 2;
            aiCounter = 1;
            if (gameBoard.level.value === "windows") {
                gameFlow.aiInput();
            } else {
                gameFlow.impAiInput();
            }

        }
        getPlayerChoice()

        endgame.style.display = "none";

    }

    /* const reset = () => {

        grids.forEach((grid) => {
            // eslint-disable-next-line no-param-reassign
            grid.classList.remove('shake')
            if (grid.hasChildNodes()) {
                grid.removeChild(grid.children[0]);
            }
        })
        gameBoard.gameArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        winnerCounter = 0;
        const firstPage = document.querySelector('.modal.info');
        endgame.style.display = "none";
        firstPage.style.display = "block";

        grids.forEach((grid) => {
            grid.addEventListener('click', addUserInput)
        })
    } */

    const findWinner = () => {
        if (winnerCounter === 1) {

            if (winnerMark === player.getMark().getAttribute('id')) {
                const humanGif = document.querySelector('.modal.human-win')
                setTimeout(() => {
                    humanGif.style.display = 'block';
                }, 5000)

                humanGif.addEventListener('click', () => {
                    endgame.style.display = 'block';
                    humanGif.style.display = 'none';
                })
            } else {
                const aiGif = document.querySelector('.modal.ai-win');
                setTimeout(() => {
                    aiGif.style.display = 'block';
                }, 5000)

                aiGif.addEventListener('click', () => {
                    endgame.style.display = 'block';
                    aiGif.style.display = 'none';
                })
            }
            grids.forEach((grid) => {
                grid.removeEventListener('click', addUserInput)
            })
        } else if (winnerCounter === 0 && gameBoard.gameArray.length === 9 && gameBoard.gameArray.filter((e) => !Number(e)).length === 9) {
            const drawGif = document.querySelector('.modal.draw')

            drawGif.style.display = 'block';
            drawGif.addEventListener('click', () => {
                endgame.style.display = 'block';
                drawGif.style.display = 'none';
            })
            grids.forEach((grid) => {
                grid.removeEventListener('click', addUserInput)
            })
        }
    }

    return { getPlayerChoice, checkRows, checkCols, checkDiag, findWinner, addUserInput, aiInput, impAiInput, rematch }

})();

gameFlow.getPlayerChoice();
rematchBtn.addEventListener('click', gameFlow.rematch)
/* resetBtn.addEventListener('click', gameFlow.reset) */

const highLevelAi = (() => {

    const checkWinnerHighAi = (curBoard, curMark) => {

        if (/* gameFlow.checkRows() || gameFlow.checkCols() || gameFlow.checkDiag() */
            (curBoard[0] === (curMark) && curBoard[1] === ((curMark)) && curBoard[2] === (curMark)) ||
            (curBoard[3] === (curMark) && curBoard[4] === (curMark) && curBoard[5] === (curMark)) ||
            (curBoard[6] === (curMark) && curBoard[7] === (curMark) && curBoard[8] === (curMark)) ||
            (curBoard[0] === (curMark) && curBoard[3] === (curMark) && curBoard[6] === (curMark)) ||
            (curBoard[1] === (curMark) && curBoard[4] === (curMark) && curBoard[7] === (curMark)) ||
            (curBoard[2] === (curMark) && curBoard[5] === (curMark) && curBoard[8] === (curMark)) ||
            (curBoard[0] === (curMark) && curBoard[4] === (curMark) && curBoard[8] === (curMark)) ||
            (curBoard[2] === (curMark) && curBoard[4] === (curMark) && curBoard[6] === (curMark))
        ) {
            return true;
        }
        return false;
    }

    const minimax = (curBoard, curMark) => {
        const grids = document.querySelectorAll('.grid');

        const possibleMovesArray = [];
        const aiMark = skynet.getMark().getAttribute('id')
        const humanMark = player.getMark().getAttribute('id')

        for (let i = 0; i < curBoard.length; i += 1) {
            if (curBoard[i] !== "x" && curBoard[i] !== "o") {
                possibleMovesArray.push(curBoard[i]);
            }
        }

        // start checking for end game state - Zero sum game. reference point to choose max & min

        if (checkWinnerHighAi(curBoard, humanMark)) {
            return { score: -100 };
            // eslint-disable-next-line no-else-return
        } else if (checkWinnerHighAi(curBoard, aiMark)) {
            return { score: 100 };
        } else if (possibleMovesArray.length === 0) {
            return { score: 0 };
        }

        const moves = []

        for (let i = 0; i < possibleMovesArray.length; i += 1) {
            const move = {};
            move.index = possibleMovesArray[i];

            // create hypothesis moves. All the moves below are fiction and should not affect 2 players real time turns

            curBoard[possibleMovesArray[i]] = curMark;

            if (curMark === aiMark) {
                const result = minimax(curBoard, humanMark);

                // Save the result variable’s score into the currentTestPlayInfo OBJECT
                move.score = result.score;
            } else {
                const result = minimax(curBoard, aiMark)

                move.score = result.score;
            }

            // reset the board state
            curBoard[possibleMovesArray[i]] = move.index

            // summarize all test plays
            moves.push(move)
        }


        // calculating the best play from the all test plays

        let bestMove;

        if (curMark === aiMark) {
            // Need to find max from nodes (e.g. (-infi, 1) && (-infi, 3) returns (1,3) => 3)

            let bestScore = -Infinity;

            for (let i = 0; i < moves.length; i += 1) {
                if (moves[i].score > bestScore) {

                    // Reassign the best score to the bigger score (guaranteed)
                    bestScore = moves[i].score

                    // join into 1 result - similar to the end game static value 
                    bestMove = i;
                }
            }
        } else {
            let bestScore = +Infinity;

            for (let i = 0; i < moves.length; i += 1) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score
                    bestMove = i;
                }
            }
        }

        playerCounter = 1;
        aiCounter = 2;

        aiMove = grids[moves[bestMove].index]
        // rescursively go back to the first node to determine the best value
        return moves[bestMove]
    }

    return { checkWinnerHighAi, minimax }
})();

document.addEventListener("DOMContentLoaded", () => {
    const submitInfo = document.querySelector('.modal.info');
    const startMenu = document.querySelector('.modal.start-menu');
    const audioLists = document.getElementsByTagName('audio')

    submitInfo.style.display = "block";
    submitBtn.addEventListener('click', () => {
        startMenu.style.display = "block";
    })
    startBtn.addEventListener('click', () => {
        startMenu.style.display = "none";
        submitInfo.style.display = "none";
        audioLists[0].play();
    })
    rematchBtn.addEventListener('click', () => {
        audioLists[1].play();
    })

});

