import { Chess } from "chess.js";
import { randomUUID } from "crypto";



export class gameFunctions {
    constructor(players, games) {
        this.players = players;
        this.games = games;
    }

    createGame(socket) {
        socket.on("newGame", ({ playerId, playerSide }) => {
            console.log(
                "New game requested from server.js by client",
                playerId,
                playerSide
            );
            const gameId = randomUUID().slice(0, 8); // Generate a random game ID
            this.games[gameId] = {
                game: new Chess(), // Create a new game instance
                moveNumber: 1, // Initialize move number
                gameStatus: "not started", // Add the player to the game
                room_players: {
                    white: playerSide === "white" ? playerId : null,
                    black: playerSide === "black" ? playerId : null
                }
            };
            // this.games[gameId]["players"] = {
            //     white: playerSide === "white" ? playerId : null,
            //     black: playerSide === "black" ? playerId : null,
            // };
            this.players[playerId]["gameId"] = gameId; // Associate the player with the game ID
            this.players[playerId]["playerStatus"] = "inRoom"; // Initialize player status
            socket.join(gameId); // Join the player to the game room
            // socket.to(gameId).emit("playerJoinedGame", {
            //     playerData: this.players[playerId],
            //     gameId: gameId,
            // }); // Notify other players in the game room that a player has joined
            socket.emit("playerJoinedGame", {
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
                socket.emit("roomDataResponse", {
                    gameId: gameId,
                    moveNumber: gameData.moveNumber,
                    gameStatus: gameData.gameStatus,
                    room_players: gameData.room_players,
                });
                console.log("Room data sent for game", gameId);
            } else {
                console.log("Game not found", gameId);
                socket.emit("gameNotFound", "Game not found");
            }
        });
    }

    joinGame(socket) {
        socket.on("joinGame", ({ roomId, playerId }) => {
            if (this.games[roomId] === undefined) {
                socket.to(roomId).emit("gameNotFound", "Game not found");
                return;
            } else {
                if (this.games[roomId].room_players.white === null) {
                    this.games[roomId].room_players.white = playerId;
                } else if (this.games[roomId].room_players.black === null) {
                    this.games[roomId].room_players.black = playerId;
                } else {
                    socket.emit("gameFull", "Game is already full");
                    return;
                }
                console.log(this.players[playerId]);
                this.players[playerId][gameId]= roomId; // Associate the player with the game ID
                this.players.playerId[playerStatus] = "inRoom"; // Initialize player status
            }
        });
    }

    makeMove(socket) {
        socket.on("move", ({ move }) => {
            const currentGameData = this.games[gameId];
            if (currentGameData.gameStatus === "not started") {
                const moveResult = currentGameData.game.move(move);
                if (moveResult) {
                    currentGameData.moveNumber++;
                    const room_players = currentGameData.room_players;
                    this.players[room_players.white]["playerStatus"] = "playing";
                    this.players[room_players.black]["playerStatus"] = "playing";
                }
            }
            else if (currentGameData.gameStatus === "playing") {
                const moveResult = currentGameData.game.move(move);
                if (moveResult) {
                    currentGameData.moveNumber++;
                    socket
                        .to(gameId)
                        .emit("moveNumber", currentGameData.moveNumber);
                }
                if (currentGameData.game.game_over()) {
                    currentGameData.gameStatus = "game over";
                    socket
                        .to(gameId)
                        .emit("gameOver", {
                            winner: currentGameData.game.turn(),
                            moveNumber: currentGameData.moveNumber,
                        });
                }
            }
        });
    }

    onAbort(socket){
        socket.on("abort", ({gameId, playerId}) => {
            if (this.games[gameId] !== undefined) {
                this.games[gameId].gameStatus = "aborted";
                socket.to(gameId).emit("gameAborted", { gameId: gameId, playerId: playerId });
                socket.leave(gameId);
                delete this.games[gameId];
            }
        })
    }

    onResign(socket){
        socket.on("resign", ({gameId, playerId}) => {
            if (this.games[gameId] !== undefined) {
                this.games[gameId].gameStatus = "resigned";
                socket.to(gameId).emit("gameResigned", { gameId: gameId, playerId: playerId });
                socket.leave(gameId);
                delete this.games[gameId];
            }
        })
    }

    onGameOver(socket) {
            socket.on("gameOver", ({gameId}) => {
                if (this.games[gameId] !== undefined){
                    socket.leave(gameId);
                    delete this.games[gameId];
                    console.log("Room deleted for game", gameId);
                }
            })
        }
}


// export function createGame(socket, players, games) {
//     socket.on("newGame", ({playerId, playerSide}) => {
//         console.log("New game requested from server.js by client", playerId, playerSide);
//         const gameId = randomUUID().slice(0, 8); // Generate a random game ID
//         games[gameId] = {
//             game: new Chess(), // Create a new game instance
//             moveNumber: 1, // Initialize move number
//             gameStatus: "not started" // Add the player to the game
//         }
//         games[gameId]["players"] = {
//             white: playerSide === "white" ? playerId : null,
//             black: playerSide === "black" ? playerId : null
//         };
//         players[playerId]["gameId"] = gameId; // Associate the player with the game ID
//         socket.join(gameId); // Join the player to the game room
//         console.log("Player joined game room", gameId);
//     })
// }

// export function getRoomData(socket, games){
//     socket.on("roomData", ({gameId}) =>{
//         if(games[gameId] !== undefined){
//             const gameData = games[gameId];
//             socket.emit("roomDataResponse", {
//                 "gameId": gameId,
//                 "moveNumber": gameData.moveNumber,
//                 "gameStatus": gameData.gameStatus,
//                 "players": gameData.players
//             });
//             console.log("Room data sent for game", gameId);
//         }
//         else{
//             console.log("Game not found", gameId);
//             socket.emit("gameNotFound", "Game not found");
//         }
//     })
// }

// export function joinGame(socket, players, games){
//     socket.on("joinGame", ({gameId, playerId}) => {
//         if (games[gameId] === undefined) {
//             socket.to(gameId).emit("gameNotFound", "Game not found");
//             return;
//         }
//         else{
//             games[gameId][players] = {
//                 white: white === null ? playerId : null,
//                 black: black === null ? playerId : null
//             }
//             players[playerId][gameId] = gameId; // Associate the player with the game ID
//         }
//     })
// }

// export function makeMove(socket, games){
//     socket.on("move", ({move}) => {
//         const currentGameData = games[gameId];
//         if (currentGameData.gameStatus === "playing") {
//             const moveResult = currentGameData.game.move(move);
//             if(moveResult){
//                 currentGameData.moveNumber++;
//                 socket.to(gameId).emit("moveNumber", currentGameData.moveNumber);
//             }
//             if (currentGameData.game.game_over()) {
//                 currentGameData.gameStatus = "game over";
//                 socket.to(gameId).emit("gameOver", { winner: currentGameData.game.turn(),moveNumber: currentGameData.moveNumber });
//             }
//         }
//     })
// }

// export function onAbort(socket, games){
//     socket.on("abort", ({gameId}) => {
//         if (games[gameId] !== undefined) {
//             games[gameId].gameStatus = "aborted";
//             socket.to(gameId).emit("gameAborted", { gameId: gameId });
//             socket.leave(gameId);
//             delete games[gameId];
//         }
//     })
// }

// export function onResign(socket, games){
//     socket.on("resign", ({gameId}) => {
//         if (games[gameId] !== undefined) {
//             games[gameId].gameStatus = "resigned";
//             socket.to(gameId).emit("gameResigned", { gameId: gameId });
//             socket.leave(gameId);
//             delete games[gameId];
//         }
//     })
// }

// export function onGameOver(socket, games) {
//     socket.on("gameOver", ({gameId}) => {
//         if (games[gameId] !== undefined){
//             socket.leave(gameId);
//             delete games[gameId];
//         }
//     })
// }


