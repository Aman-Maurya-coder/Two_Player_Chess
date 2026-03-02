import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { playerFunctions } from "./handlers/playerHandlers.js";
import { gameFunctions } from "./handlers/gameHandlers.js";
import dotenv from "dotenv";

dotenv.config();
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);
            
            const allowedOrigins = [
                // "http://localhost:4173",
                // "https://admin.socket.io",
                CORS_ORIGIN,
            ];
            
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            
            // // For development, allow devtunnel origins
            // if (origin.includes('devtunnels.ms')) {
            //     return callback(null, true);
            // }
            
            callback(new Error('Not allowed by CORS'));
        },
        methods: ["GET", "POST"],
        credentials: true,
    },
});

global.io = io;

const games = {}; // Store games by room ID
const players = {}; // Store players by player ID
const timers = {};

const playerHandler = new playerFunctions(players); // Create an instance of player functions
const gameHandler = new gameFunctions(players, games, timers); // Create an instance of game handler

// app.use(cors());
instrument(io, {
    auth: false,
    mode: "development",
});

io.on("connection", (socket) => {
    console.log("connection succesfull", socket.id);

    playerHandler.onPlayerJoin(socket, games); // Handle player joining
    playerHandler.getPlayerData(socket); // Handle getting player data
    playerHandler.onRejoinGame(socket, games); // Handle player rejoining
    playerHandler.onRejoinCancel(socket, games); // Handle player canceling rejoin
    playerHandler.onDisconnect(socket, games); // Handle player disconnection

    gameHandler.createGame(socket); // Handle game creation
    gameHandler.getRoomData(socket); // Handle getting room data
    gameHandler.getGameData(socket); // Handle getting game data
    gameHandler.joinGame(socket); // Handle joining a game
    gameHandler.makeMove(socket); // Handle moves
    gameHandler.onAbort(socket); // Handle aborting a game
    gameHandler.onResign(socket); // Handle resigning
    gameHandler.onOfferDraw(socket); // Handle draw offer
    gameHandler.onDrawAccept(socket); // Handle draw acceptance
    gameHandler.onDrawReject(socket); // Handle draw rejection
    gameHandler.onPlayAgain(socket); // Handle play again request
    gameHandler.onPlayAgainAccept(socket); // Handle play again acceptance
    gameHandler.onPlayAgainReject(socket); // Handle play again rejection
    gameHandler.onRoomClose(socket); // Handle game over

    socket.on("disconnect", (reason) => {
        console.log("Player disconnected", reason);
    });
});

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});
