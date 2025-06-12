import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
// import { createGame, makeMove, joinGame, onAbort, onResign, onGameOver, getRoomData } from "./handlers/gameHandlers.js";
// import { getPlayerData, onDisconnect, onPlayerJoin } from "./handlers/playerHandlers.js";
import { playerFunctions } from "./handlers/playerHandlers.js";
import { gameFunctions } from "./handlers/gameHandlers.js";
// import { on } from "events";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

global.io = io;

const games = {}; // Store games by room ID
const players = {}; // Store players by player ID
const timers = {};

const playerHandler = new playerFunctions(players); // Create an instance of player functions
const gameHandler = new gameFunctions(players, games, timers); // Create an instance of game handler

app.use(cors());

io.on("connection", (socket) => {
    console.log("connection succesfull", socket.id);

    // onPlayerJoin(socket, players); // Handle player joining
    // onDisconnect(socket, players, games); // Handle player disconnection
    // getPlayerData(socket, players); // Handle getting player data
    playerHandler.onPlayerJoin(socket, games); // Handle player joining
    playerHandler.getPlayerData(socket); // Handle getting player data
    playerHandler.onDisconnect(socket, games); // Handle player disconnection



    // createGame(socket, players, games); // Handle game creation
    // joinGame(socket, players, games); // Handle joining a game
    // makeMove(socket, games); // Handle moves
    // onAbort(socket, games); // Handle aborting a game
    // onResign(socket, games); // Handle resigning
    // onGameOver(socket, games); // Handle game over
    // getRoomData(socket, games); // Handle getting room data
    gameHandler.createGame(socket); // Handle game creation
    gameHandler.getRoomData(socket); // Handle getting room data
    gameHandler.joinGame(socket); // Handle joining a game
    gameHandler.makeMove(socket); // Handle moves
    gameHandler.onAbort(socket); // Handle aborting a game
    gameHandler.onResign(socket); // Handle resigning
    gameHandler.onRoomClose(socket); // Handle game over

    

});

httpServer.listen(3000);