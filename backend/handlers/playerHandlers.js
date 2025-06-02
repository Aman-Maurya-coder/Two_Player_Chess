import { randomUUID } from "crypto";

export function onPlayerJoin(socket, players) {
    socket.on("onPlayerJoin", ({playerId}) => {
        if (players[playerId] === undefined) {
            playerId = randomUUID(); // Generate a random player ID
            players[playerId] = { "gameId": null }; // Associate the player with the game ID
            socket.emit("playerId", playerId); // Send the player ID back to the client
            console.log("Player joined", playerId);
        }
        if (
            players[playerId] !== undefined &&
            players[playerId].gameId !== null
        ) {
            socket.join(players[playerId].gameId); // Join the player to the game room
            console.log("Player joined game room", players[playerId].gameId);
        }
    });
}

export function getPlayerData(socket, players){
    socket.on("playerData", ({playerId}) => {
        if(players[playerId] !== undefined){
            socket.emit("playerDataResponse", players[playerId]); // Send player data back to the client
            console.log("Player data sent", playerId);
        }
        else{
            console.log("Player not found", playerId);
            socket.emit("playerNotFound"); // Notify the client if player is not found
        }
    })
}

export function onDisconnect(socket, players, games) {
    socket.on("Disconnect", ({playerId}) => {
        if (players[playerId] !== undefined) {
            if (players[playerId].gameId !== null) {
                const gameId = players[playerId].gameId;
                games[gameId].gameStatus = "disconnected";
                socket
                    .to(gameId)
                    .emit("playerDisconnectedFromGame", gameId);
                console.log("Player disconnected from game", playerId, gameId);
            }
            // delete players[playerId]; // Remove the player from the players object
            socket
                    .emit("playerDisconnected"); // Notify the client about disconnection
            console.log("Player disconnected", playerId);
        }
        else{
            console.log("Player not found", playerId);
            socket.emit("playerNotFount");
        }
    });
}
