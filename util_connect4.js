'use strict'
const victory = 6; //Nombre d'alignements pour gagner

let utils = {
    //Vérifie si 4 jetons de la même couleurs sont alignés en horizontal, vertical ou diagonal (l et r)
    checkWin: (room, row, col) => {
        let win = false;
        let result = 1;
        result = utils.checkHorizontal(room, row, col, 0);
        if (result >= victory) {
            win = true;
        }

        if (!win) {
            result = utils.checkVertical(room, row, col, 0);
            if (result >= victory) {
                win = true;
            }
        }
        if (!win) {
            result = utils.checkDiagonalRightUp(room, row, col, 0);
            if (result >= victory) {
                win = true;
            }
        }
        if (!win) {
            result = utils.checkDiagonalLeftUp(room, row, col, 0);
            if (result >= victory) {
                win = true;
            }
        }
        return win;
    },
    //vérifie s'il ya 4 jetons identiques alignés horizontalement
    checkHorizontal: (room, row, col, step) => {
        let result = 1;
        let board = utils.games[room].board;
        let player = board[row][col];

        if (typeof board[row][col + step] !== 'undefined' && board[row][col + step] == player) {
            if (step >= 0) {
                result = result + utils.checkHorizontal(room, row, col + step, 1);
            }
            if (step <= 0) {
                result = result + utils.checkHorizontal(room, row, col + step, -1);
            }
        }

        return result
    },
    //vérifie s'il y a 4 jetons identiques alignés verticalement
    checkVertical: (room, row, col, step) => {
        let result = 1;
        let board = utils.games[room].board;
        let player = board[row][col];

        if (typeof board[row + step] !== 'undefined' && typeof board[row + step][col] !== 'undefined' && board[row + step][col] == player) {
            if (step >= 0) {
                result = result + utils.checkVertical(room, row + step, col, 1);
            }
            if (step <= 0) {
                result = result + utils.checkVertical(room, row + step, col, -1);
            }
        }

        return result
    },
    //vérifie s'il y a 4 jetons identiques alignés sur la diagonale /
    checkDiagonalRightUp: (room, row, col, step) => {
        let result = 1;
        let board = utils.games[room].board;
        let player = board[row][col];

        if (typeof board[row + step] !== 'undefined' && typeof board[row + step][col + step] !== 'undefined' && board[row + step][col + step] == player) {
            if (step >= 0) {
                result = result + utils.checkDiagonalRightUp(room, row + step, col + step, 1);
            }
            if (step <= 0) {
                result = result + utils.checkDiagonalRightUp(room, row + step, col + step, -1);
            }
        }

        return result
    },
    //vérife s'il y a 4 jetons identiques alignés sur la diagonale \
    checkDiagonalLeftUp: (room, row, col, step) => {
        let result = 1;
        let board = utils.games[room].board;
        let player = board[row][col];

        if (typeof board[row + step] !== 'undefined' && typeof board[row + step][col - step] !== 'undefined' && board[row + step][col - step] == player) {
            if (step >= 0) {
                result = result + utils.checkDiagonalLeftUp(room, row + step, col - step, 1);
            }
            if (step <= 0) {
                result = result + utils.checkDiagonalLeftUp(room, row + step, col - step, -1);
            }
        }

        return result
    },
    //pose un jeton dans une colonne sur le plus petit niveau de ligne possible
    move: (room, col, player) => {
        let isGood = false;
        let board = utils.games[room].board
        for (let i = 0; i < board.length; i++) {
            if (board[i][col] == 0) {
                board[i][col] = player;
                isGood = true;
                utils.games[room].lastMove = {
                    row: i,
                    col: col
                }
                utils.games[room].moves++;
                break;
            }
        }
        return isGood;
    },
    //genere la clef de hashage pour vérifier les users sur les parties
    generateHash: (length) => {
        let haystack = 'GgOoJjBb2017';
        let output = '';
        for (let i = 0; i < length; i++) {
            output += haystack.charAt(Math.floor(Math.random() * haystack.length));
        }
        return output;

    },
    //contient la liste de toutes les parties en cours ainsiq ue leur infos respectives.
    games: {}
};

module.exports = utils;