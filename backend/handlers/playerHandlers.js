import { randomUUID } from "crypto";

// export function onPlayerJoin(socket, players) {
//     socket.on("onPlayerJoin", ({playerId}) => {
//         if (players[playerId] === undefined) {
//             playerId = randomUUID(); // Generate a random player ID
//             players[playerId] = { "gameId": null }; // Associate the player with the game ID
//             socket.emit("playerId", playerId); // Send the player ID back to the client
//             console.log("Player joined", playerId);
//         }
//         if (
//             players[playerId] !== undefined &&
//             players[playerId].gameId !== null
//         ) {
//             socket.join(players[playerId].gameId); // Join the player to the game room
//             console.log("Player joined game room", players[playerId].gameId);
//         }
//     });
// }

// export function getPlayerData(socket, players){
//     socket.on("playerData", ({playerId}) => {
//         if(players[playerId] !== undefined){
//             socket.emit("playerDataResponse", players[playerId]); // Send player data back to the client
//             console.log("Player data sent", playerId);
//         }
//         else{
//             console.log("Player not found", playerId);
//             socket.emit("playerNotFound"); // Notify the client if player is not found
//         }
//     })
// }

// export function onDisconnect(socket, players, games) {
//     socket.on("Disconnect", ({playerId}) => {
//         if (players[playerId] !== undefined) {
//             if (players[playerId].gameId !== null) {
//                 const gameId = players[playerId].gameId;
//                 games[gameId].gameStatus = "disconnected";
//                 socket
//                     .to(gameId)
//                     .emit("playerDisconnectedFromGame", gameId);
//                 console.log("Player disconnected from game", playerId, gameId);
//             }
//             // delete players[playerId]; // Remove the player from the players object
//             socket
//                     .emit("playerDisconnected"); // Notify the client about disconnection
//             console.log("Player disconnected", playerId);
//         }
//         else{
//             console.log("Player not found", playerId);
//             socket.emit("playerNotFount");
//         }
//     });
// }

export class playerFunctions {
    constructor(players) {
        this.players = players;
    }

    onPlayerJoin(socket, games) {
        socket.on("onPlayerJoin", ({ playerId }) => {
            console.log(playerId);
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
                socket.join(this.players[playerId]["gameId"]); // Join the player to the game room
                // games[this.players[playerId]["gameId"]]["gameStatus"] = this.players[playerId]["playerStatus"] === "inRoom" ? "not started" : "playing";
                console.log(this.players[playerId]["gameId"]);
                console.log(games);
                const gameId = this.players[playerId]["gameId"];
                console.log(games[gameId]);
                if (this.players[playerId]["playerStatus"] === "disconnected from room") {
                    games[gameId]["gameStatus"] = "not started"; // Update game status if player is in room
                    this.players[playerId]["playerStatus"] = "inRoom"; // Update player status to inGame
                } else {
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
                if (this.players[playerId]["gameId"] !== null) {
                    const gameId = this.players[playerId]["gameId"];
                    const gameStatus = games[gameId]["gameStatus"];
                    this.players[playerId]["playerStatus"] = gameStatus === "not started" ? "disconnected from room" : "disconnected from game"; // Update player status
                    games[gameId]["gameStatus"] = "disconnected";
                    socket.emit(this.players[playerId]["playerStatus"] === "disconnected from room" ? "playerDisconnectedFromRoom" : "playerDisconnectedFromGame", playerId);
                    console.log(
                        "Player disconnected from game",
                        playerId,
                        gameId
                    );
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
