import { Chess } from "chess.js";
import { time } from "console";
import { randomUUID } from "crypto";



export class gameFunctions {
    constructor(players, games) {
        this.players = players;
        this.games = games;
        this.timers = {}; // Store actice timers
    }

    createGame(socket) {
        socket.on("newGame", ({ playerId, playerSide, timeControl }) => {
            console.log(
                "New game requested from server.js by client",
                playerId,
                playerSide
            );
            const gameId = randomUUID().slice(0, 8); // Generate a random game ID

            const timerControl = timeControl || { time : 30000, increment: 0 }; // Default time control if not provided
            const timerInMs = timerControl.time * 60 * 1000; // Convert to milliseconds

            this.games[gameId] = {
                game: new Chess(), // Create a new game instance
                moveNumber: 1, // Initialize move number
                gameStatus: "waiting for player 2", // Add the player to the game
                roomPlayers: {
                    white: playerSide === "white" ? playerId : null,
                    black: playerSide === "black" ? playerId : null
                },
                gameTimer: {
                    white: timerInMs,
                    black: timerInMs,
                    increment: timerControl.increment * 1000, // Convert increment to milliseconds
                    lastMoveTime: null, // Initialize last move time
                }, 
            };
            this.players[playerId]["gameId"] = gameId; // Associate the player with the game ID
            this.players[playerId]["playerStatus"] = "inRoom"; // Initialize player status
            socket.join(gameId); // Join the player to the game room
            // socket.in(gameId).emit("playerJoinedGame", {
            //     playerData: this.players[playerId],
            //     gameId: gameId,
            // }); // Notify other players in the game room that a player has joined
            socket.emit("gameRoomCreated", {
                playerData: this.players[playerId],
                gameId: gameId,
            });
            console.log("Player joined game room", gameId);
        });
    }

    getRoomData(socket) {
        socket.on("roomData", ({ gameId }) => {
            if (this.games[gameId] !== undefined) {
                const gameData = this.games[gameId];
                const playerId = this.players.entries().filter((playerData) => {
                    return playerData[1]["gameId"] === gameId
                })[0]
                const playerSide = gameData["roomPlayers"]["white"] === playerId ? "white" : "black";
                socket.emit("roomDataResponse", playerSide, gameData); // Send room data back to the client
                console.log("Room data sent for game", gameId);
            } else {
                console.log("Game not found", gameId);
                socket.emit("gameNotFound", "Game not found");
            }
        });
    }

    joinGame(socket) {
        socket.on("joinGame", ({ roomId, playerId }) => {
            console.log(roomId);
            const game = this.games[roomId];
            if (game === undefined) {
                socket.emit("gameNotFound", "Game not found");
                return;
            }
            else if (game["gameStatus"] === "room full") {
                socket.emit("gameFull", "Game is already full. Please try joining another game."); // Notify the client if game is full
                return;
            }
            else {
                socket.join(roomId); // Join the player to the game room
                if (this.games[roomId]["roomPlayers"]["white"] === null) {
                    this.games[roomId]["roomPlayers"]["white"] = playerId;
                } 
                else if (this.games[roomId]["roomPlayers"]["black"] === null) {
                    this.games[roomId]["roomPlayers"]["black"] = playerId;
                } 
                else {
                    socket.emit("gameFull", "Game is already full");
                    return;
                }
                // console.log(this.players[playerId]);
                this.games[roomId]["gameStatus"] = "room full"; // Set game status to not started
                this.players[playerId]["gameId"]= roomId; // Associate the player with the game ID
                this.players[playerId]["playerStatus"] = "inRoom"; // Initialize player status
                socket.in(roomId).emit("playerJoinedRoom", roomId);
            }
        });
    }

    startGameTimer(gameId) {
        if (!this.games[gameId] || this.timers[gameId]) return;

        const game = this.games[gameId];
        
        this.timers[gameId] = setInterval(() => {
            if (game.gameStatus === "playing") {
                const currentPlayer = game.game.turn();
                
                // Deduct 1 second from current player's time
                game.gameTimer[currentPlayer] -= 1000;
                
                // Broadcast time update to all players in the room
                this.broadcastTimeUpdate(gameId);
                
                // Check for time out
                if (game.gameTimer[currentPlayer] <= 0) {
                    this.handleTimeOut(gameId, currentPlayer);
                }
            }
        }, 1000); // Update every second
    }

    broadcastTimeUpdate(gameId) {
        const game = this.games[gameId];
        if (!game) return;

        // Emit to all players in the room
        global.io.to(gameId).emit("timeUpdate", {
            whiteTime: game.gameTimer.white,
            blackTime: game.gameTimer.black,
            currentTurn: game.game.turn()
        });
    }

    handleTimeOut(gameId, player) {
        const game = this.games[gameId];
        if (!game) return;

        // Stop the time
        this.stopGameTimer(gameId);
        
        // Set game status
        game.gameStatus = "timeout";
        
        // Determine winner
        const winner = player === "white" ? "black" : "white";
        
        // Broadcast timeout event
        global.io.to(gameId).emit("gameTimeout", {
            loser: player,
            winner: winner,
            reason: "timeout"
        });
        
        console.log(`Game ${gameId}: ${player} lost on time`);
    }

    stopGameTimer(gameId) {
        if (this.timers[gameId]) {
            clearInterval(this.timers[gameId]);
            delete this.timers[gameId];
        }
    }

    makeMove(socket) {
        socket.on("move", ({ move, gameId }) => {
            const currentGameData = this.games[gameId];
            if(!currentGameData){
                socket.emit("invalidGameId", "The gameId is invalid");
                return;
            }
            const currentTime = Date.now()
            const moveResult = currentGameData.game.move(move);
            if(moveResult){
                if(currentGameData.gameTimer.lastMoveTime){
                    const currentPlayer = currentGameData.game.turn();
                    currentGameData.gameTimer[currentPlayer] += currentGameData.gameTimer.increment;
                }

                currentGameData.gameTimer.lastMoveTime = currentTime;
                currentGameData.moveNumber++;
            }
            if (currentGameData.gameStatus === "room full") {
                currentGameData.gameStatus = "playing";
                this.startGameTimer(gameId);
                
                const room_players = currentGameData.roomPlayers;
                this.players[room_players.white]["playerStatus"] = "playing";
                this.players[room_players.black]["playerStatus"] = "playing";
            }

            // Broadcast move and time update
            socket.in(gameId).emit("moveMade", {
                // move: moveResult,
                fen: currentGameData.game.fen(),
                // moveNumber: currentGameData.moveNumber,
                currentTurn: currentGameData.game.turn()
            });
            socket.in(gameId).emit("incrementedTime", {
                whiteTime: currentGameData.gameTimer.white,
                blackTime: currentGameData.gameTimer.black,
                currentTurn: currentGameData.game.turn()
            });

            this.broadcastTimeUpdate(gameId);

            // Check for game over
            if (currentGameData.game.game_over()) {
                this.stopGameTimer(gameId);
                currentGameData.gameStatus = "game over";
                let reason;
                if (currentGameData.game.isCheckmate()) reason = "checkmate"
                else if (currentGameData.game.isStalemate()) reason = "stalemate"
                else if (currentGameData.game.isDraw()) reason = "draw"
                else if (currentGameData.game.isInsufficientMaterial()) reason = "insufficient material"
                else if (currentGameData.game.isDrawByFiftyMoves()) reason = "draw by fifty moves"
                else if (currentGameData.game.isThreefoldRepetition()) reason = "threefold repetition"
                else reason = "unknown reason";
                socket.in(gameId).emit("gameOver", {
                    winner: currentGameData.game.turn(),
                    // moveNumber: currentGameData.moveNumber,
                    reason: reason
                });
            }


            // else if (currentGameData.gameStatus === "playing") {
            //     const moveResult = currentGameData.game.move(move);
            //     if (currentGameData.game.game_over()) {
            //         currentGameData.gameStatus = "game over";
            //         if (currentGameData.game.turn === "white") 
            //             currentGameData.gameTimer.white -= timeTaken;
            //         else
            //             currentGameData.gameTimer.black -= timeTaken;
                    
            //         socket
            //             .to(gameId)
            //             .emit("gameOver", {
            //                 winner: currentGameData.game.turn(),
            //                 moveNumber: currentGameData.moveNumber,
            //             });
            //     }
            //     if (moveResult) {
            //         currentGameData.moveNumber++;
            //         if (currentGameData.game.turn === "white") 
            //             currentGameData.gameTimer.white -= timeTaken;
            //         else
            //             currentGameData.gameTimer.black -= timeTaken;
            //         socket
            //             .to(gameId)
            //             .emit("moveInfo", {moveNumber: currentGameData.moveNumber, timeControls: currentGameData.gameTimer});
            //     }
                
            // }
        });
    }

    onAbort(socket){
        socket.on("abort", ({gameId, playerId}) => {
            if (this.games[gameId] !== undefined) {
                this.stopGameTimer(gameId);
                this.games[gameId].gameStatus = "aborted";
                // socket.leave(gameId);
                // delete this.games[gameId];
                socket.in(gameId).emit("gameAborted", {message: "game aborted successfully", gameStatus: "aborted" });
            }

        })
    }

    onResign(socket){
        socket.on("resign", ({gameId}) => {
            if (this.games[gameId] !== undefined) {
                this.stopGameTimer(gameId);
                this.games[gameId].gameStatus = "resigned";
                // socket.in(gameId).emit("gameResigned", { gameId: gameId, playerId: playerId });
                // socket.leave(gameId);
                // delete this.games[gameId];
                socket.in(gameId).emit("gameAborted", {message: "game aborted successfully", gameStatus: "aborted" });
            }
        })
    }

    onRoomClose(socket) {
            socket.on("closeRoom", ({gameId}) => {
                if (this.games[gameId] !== undefined){
                    this.stopGameTimer(gameId);
                    socket.leave(gameId);
                    delete this.games[gameId];
                    console.log("Room deleted for game", gameId);
                }
            })
        }
}