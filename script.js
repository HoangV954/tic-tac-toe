const displayBoard = (() => {
    const board = document.querySelector('.board');

    const createBoard = () => {
        for(let i = 0; i < 9; i+= 1) {
            const grid = document.createElement('div');
            board.appendChild(grid)
        }
    }

    return {createBoard}
})();

displayBoard.createBoard()