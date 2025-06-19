import { randomUUID } from "crypto";

//IMP: there is a bug where when the user refresh after creating a game and leaves when the second player is not connected the game room is getting destroyed but gameId from the player data is not getting null.
//IMP: Disconnet not working properly. Game Room closed console log is not getting printed when the player disconnects from the game room.

export class playerFunctions {
    constructor(players) {
        this.players = players;
    }

    onPlayerJoin(socket, games) {
        socket.on("onPlayerJoin", ({playerId}) => {
            console.log("player joined", playerId);
            if (playerId === "") {
                playerId = randomUUID(); // Generate a random player ID
                this.players[playerId] = { 
                    gameId: null,
                    playerStatus: "online" // Initialize player status
                 }; // Associate the player with the game ID
                socket.emit("playerId", playerId); // Send the player ID back to the client
                console.log("Player joined", playerId);
            }
            else if (this.players[playerId] === undefined) {
                socket.emit("playerDoesNotExist"); // Notify the client if player is not found
            }
            else if (this.players[playerId] !== undefined && this.players[playerId]["gameId"] !== null) {
                const gameId = this.players[playerId]["gameId"];
                if(games[gameId]["gameStatus"] === "room full" || games[gameId]["gameStatus"] === "playing") {
                    socket.emit("gameFull", "Game is full. Please try joining another game."); // Notify the client if game is full
                    return;
                }
                // games[this.players[playerId]["gameId"]]["gameStatus"] = this.players[playerId]["playerStatus"] === "inRoom" ? "not started" : "playing";
                // console.log(this.players[playerId]["gameId"]);
                // console.log(games);
                // console.log(games[gameId]);
                if (this.players[playerId]["playerStatus"] === "disconnected from room") {
                    socket.join(this.players[playerId]["gameId"]); // Join the player to the game room
                    games[gameId]["gameStatus"] = "room full"; // Update game status if player is in room
                    this.players[playerId]["playerStatus"] = "inRoom"; // Update player status to inGame
                } else if (this.players[playerId]["playerStatus"] === "disconnected from game") {
                    games[gameId]["gameStatus"] = "playing"; // Update game status if player is playing
                    this.players[playerId]["playerStatus"] = "playing"; // Update player status to playing
                }
                console.log(
                    "Player joined game room",this.players[playerId]["gameId"]
                );
            }
            else if (this.players[playerId] !== undefined && this.players[playerId]["gameId"] === null){
                socket.emit("playerAlreadyJoined");
            }
        });
    }

    getPlayerData(socket) {
        socket.on("playerData", ({ playerId }) => {
            if (this.players[playerId] !== undefined) {
                socket.emit("playerDataResponse", this.players[playerId]); // Send player data back to the client
                console.log("Player data sent", playerId);
            } else {
                console.log("Player not found", playerId);
                socket.emit("playerNotFound"); // Notify the client if player is not found
            }
        });
    }

    onDisconnect(socket, games) {
        socket.on("Disconnect", ({ playerId }) => {
            if (this.players[playerId] !== undefined) {
                console.log("Player disconnected", playerId);
                if (this.players[playerId]["gameId"] !== null) {
                    const gameId = this.players[playerId]["gameId"];
                    console.log(games);
                    if (games[gameId]["gameStatus"] === "room full") {
                        games[gameId]["gameStatus"] = "waiting for player 2"; // Update game status if player is in room
                        this.players[playerId]["playerStatus"] = "disconnected from room"; // Update player status to disconnected from 
                        console.log("player left from the room", gameId);
                        global.io.in(gameId).emit("playerDisconnected", games[gameId])
                    }
                    else if (games[gameId]["gameStatus"] === "playing") {
                        games[gameId]["gameStatus"] = "waiting for reconnection"; // Update game status if player is playing
                        this.players[playerId]["playerStatus"] = "disconnected from game"; // Update player status to disconnected from game
                        console.log("player left from the game", gameId);
                        global.io.in(gameId).emit("playerDisconnected", games[gameId])
                    }
                    else if (games[gameId]["gameStatus"] === "waiting for player 2" || games[gameId]["gameStatus"] === "waiting for reconnection") {
                        console.log("Game room closed", gameId);
                        delete games[gameId]; // Remove the game from the games object if it is closed
                        delete this.players[playerId];
                        socket.emit("gameRoomClosed", gameId); // Notify the client that the game room is closed
                    }
                    else if (["resigned", "aborted", "game over"].includes(games[gameId]["gameStatus"])){
                        games[gameId]["gameStatus"] = "waiting for player 2"; // Update game status if player has resigned or aborted
                        this.players[playerId]["playerStatus"] = "disconnected from room"; // Update player status to disconnected from room
                        console.log("player left from the game", gameId);
                        global.io.in(gameId).emit("playerDisconnected", games[gameId]) // Notify the game room that a player has disconnected
                    }
                    else {
                        console.log("Game room closed", gameId, games[gameId]["gameStatus"]);
                        delete this.players[playerId];
                    }
                }
                else{
                    socket.emit("playerLeft"); // Notify the client about disconnection
                    delete this.players[playerId]; // Remove the player from the players object
                    console.log("Player left", playerId);
                }
            } else {
                console.log("Player not found", playerId);
                socket.emit("playerNotFound");
            }
        });
    }
}
