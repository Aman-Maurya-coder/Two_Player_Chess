import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createGame, makeMove, joinGame, onAbort, onResign, onGameOver, getRoomData } from "./handlers/gameHandlers.js";
import { getPlayerData, onDisconnect, onPlayerJoin } from "./handlers/playerHandlers.js";
// import { on } from "events";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const games = {}; // Store games by room ID
const players = {}; // Store players by player ID

app.use(cors());

io.on("connection", (socket) => {
    console.log("connection succesfull", socket.id);

    onPlayerJoin(socket, players); // Handle player joining
    createGame(socket, players, games); // Handle game creation
    joinGame(socket, players, games); // Handle joining a game
    makeMove(socket, games); // Handle moves
    onAbort(socket, games); // Handle aborting a game
    onResign(socket, games); // Handle resigning
    onGameOver(socket, games); // Handle game over
    onDisconnect(socket, players, games); // Handle player disconnection
    getPlayerData(socket, players); // Handle getting player data
    getRoomData(socket, games); // Handle getting room data
    

});

httpServer.listen(3000);