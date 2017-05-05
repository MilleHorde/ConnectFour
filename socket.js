'use strict'
const utils = require('./util_connect4');
const models = require('./models');

module.exports = {
    connectGame: (app) => {
        let server = require('socket.io')(app);

        //Lors de la connexion d'une socket sur le serveur
        server.on('connection', (socket) => {
            //dès qu'une socket souhaite rejoindre une partie
            socket.on('joinGame', (data) => {
                if (data.room in utils.games && data.userId != utils.games[data.room].p1.playerId) { //si partie déjà crée par le joueur 1 => joueur 2
                    console.log('Player 2 is connected')
                    let game = utils.games[data.room];
                    if (typeof game.player2 !== 'undefined') {
                        return;
                    }
                    socket.join(data.room);
                    socket.room = data.room;
                    socket.player = 2;
                    socket.playerId = data.userId;
                    socket.nickname = data.nickname;
                    socket.hash = utils.generateHash(8);
                    game.p2 = socket;
                    socket.opponent = game.p1;
                    game.p1.opponent = socket;
                    socket.emit('youAre', {
                        player: socket.player,
                        hash: socket.hash
                    });

                    //Choix du joueur commençant
                    game.turn = Math.floor((Math.random() * 2) + 1);
                    server.to(socket.room).emit('start', {
                        startPlayer: game.turn,
                        p1: game.p1.nickname,
                        p2: game.p2.nickname
                    });
                } else { //sinon création partie par un joueur 1
                    console.log('Player 1 is connected!')
                    if (typeof utils.games[data.room] === "undefined"){
                        socket.join(data.room);
                    }
                    socket.room = data.room;
                    socket.player = 1;
                    socket.playerId = data.userId;
                    socket.nickname = data.nickname;
                    socket.hash = utils.generateHash(8);
                    utils.games[data.room] = {
                        p1: socket,
                        again : 0,
                        moves: 0,
                        lastMove: 0,
                        board: [
                            [0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0]
                        ]
                    }
                    socket.emit('youAre', {
                        player: socket.player,
                        hash: socket.hash
                    })
                }
            })
            //effectue les différentes actions sur le dépôt d'un jeton dans une colonne par un utilisateur et vérifie si il y victoire
            socket.on('move', (data) => {
                let game = utils.games[socket.room];
                if (data.hash = socket.hash && game.turn == socket.player) {
                    let tryMove = utils.move(socket.room, data.col, socket.player);
                    if (tryMove) {
                        game.turn = (socket.player == 1)?2:1;
                        server.to(socket.room).emit('playerMove', {
                            player: socket.player,
                            newMove: game.lastMove,
                            turn: game.turn
                        });
                        let winner = utils.checkWin(socket.room, game.lastMove.row, game.lastMove.col);
                        //Victoire d'un joueur
                        if (winner) {
                            console.log("and the winner is.... Player " + socket.player)
                            models.game.create({
                                playerOne: game.p1.playerId,
                                playerTwo: game.p2.playerId,
                                moves: game.moves,
                                winner: socket.playerId
                            }, (err, game) => {
                                if (err) console.log(err)
                            })
                            server.to(socket.room).emit('winner', {
                                winner: socket.player,
                                moves: game.moves
                            });
                        }
                        //Totalité de l'espace de jeu utilisé, reset de cet espace
                        if (game.moves >= 42) {
                            console.log('board is full, reset...');
                            game.moves = 0;
                            game.board = [
                                [0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0]
                            ];
                            game.lastMove = 0;
                            server.to(socket.room).emit('reset');
                        }

                    }
                }
            })

            //permet à deux joueurs d'accord de rejouer l'un contre l'autre directement
            socket.on("playAgain", ()=>{
                utils.games[socket.room].again += 1;
                if(utils.games[socket.room].again == 2){
                    server.to(socket.room).emit('againGame', socket.playerId+Date.now())
                }
            })

            //gère la déconnexion d'une socket sur la gestion des parties de puissance 4
            socket.on('disconnect', () => {
                if (socket.room in utils.games) {
                    if(utils.games[socket.room].again != 2){
                        server.to(socket.room).emit('leavePlayer');
                    }
                    delete utils.games[socket.room];
                    console.log('Game closed: ' + socket.room);
                } else {
                    console.log('disconnect called but nothing happend');
                }
            })
        })
    }
}