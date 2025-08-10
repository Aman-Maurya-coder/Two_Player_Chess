# Backend Architecture

This document describes the backend architecture, server setup, and Socket.io event handling for the Two Player Chess Node.js application.

## Overview

The backend is built with Node.js, Express, and Socket.io to provide real-time multiplayer chess functionality. It handles player management, game rooms, chess logic validation, and real-time communication between clients.

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **Chess.js** - Chess game logic and validation
- **UUID** - Generate unique identifiers
- **CORS** - Cross-origin resource sharing

## Project Structure

```
backend/
├── handlers/              # Socket.io event handlers
│   ├── gameHandlers.js   # Game-related event handling
│   └── playerHandlers.js # Player-related event handling
├── package.json          # Dependencies and scripts
└── server.js            # Main server file and configuration
```

## Server Configuration

### Main Server Setup (server.js)

```javascript
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();
const httpServer = createServer(app);

// Socket.io configuration with CORS
const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            // Dynamic CORS handling for development and production
            const allowedOrigins = [
                "http://localhost:3000",
                "http://localhost:5173",
                "https://admin.socket.io"
            ];
            
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            
            // Allow devtunnel origins for development
            if (origin.includes('devtunnels.ms')) {
                return callback(null, true);
            }
            
            callback(new Error('Not allowed by CORS'));
        },
        methods: ["GET", "POST"],
        credentials: true,
    },
});
```

### Global State Management

The server maintains three main data structures:

```javascript
const games = {};    // Store games by room ID
const players = {};  // Store players by player ID  
const timers = {};   // Store timer data by room ID

// Make io globally available
global.io = io;
```

### Admin UI Integration

```javascript
// Socket.io Admin UI for monitoring connections
instrument(io, {
    auth: false,
    mode: "development",
});
```

## Data Models

### Player Model
```javascript
{
    id: string,           // Unique player identifier
    name: string,         // Player display name
    socketId: string,     // Current socket connection ID
    roomId?: string,      // Current room (if in game)
    isConnected: boolean, // Connection status
    lastSeen: timestamp   // Last activity timestamp
}
```

### Game Model
```javascript
{
    roomId: string,       // Unique room identifier
    players: {
        white: {
            id: string,
            name: string,
            socketId: string
        },
        black: {
            id: string, 
            name: string,
            socketId: string
        }
    },
    gameState: string,    // "waiting", "active", "finished"
    chess: Chess,         // Chess.js game instance
    currentTurn: string,  // "white" | "black"
    moveHistory: array,   // Array of move objects
    gameResult?: {
        winner?: string,
        reason: string,   // "checkmate", "resign", "draw", "timeout"
        endTime: timestamp
    },
    createdAt: timestamp,
    gameOptions: {
        timeControl: number, // minutes per player
        increment: number,   // seconds per move
        variant: string      // "standard", "rapid", "blitz"
    },
    timers: {
        white: number,    // remaining time in milliseconds
        black: number,    // remaining time in milliseconds
        lastMoveTime: timestamp
    }
}
```

### Timer Model
```javascript
{
    roomId: string,
    intervalId: NodeJS.Timeout,
    isActive: boolean,
    currentPlayer: string, // "white" | "black"
    lastUpdateTime: timestamp
}
```

## Handler Classes

### Player Handler (playerHandlers.js)

Manages player lifecycle, connections, and reconnections.

```javascript
export class playerFunctions {
    constructor(players) {
        this.players = players;
    }

    onPlayerJoin(socket, games) {
        socket.on("player-join", (data) => {
            // Handle new player registration or existing player reconnection
        });
    }

    getPlayerData(socket) {
        socket.on("get-player-data", () => {
            // Return current player information
        });
    }

    onRejoinGame(socket, games) {
        socket.on("rejoin-game", (data) => {
            // Handle player rejoining after disconnection
        });
    }

    onDisconnect(socket, games) {
        socket.on("disconnect", (reason) => {
            // Handle player disconnection and cleanup
        });
    }
}
```

#### Key Player Methods

**Player Registration**
```javascript
onPlayerJoin(socket, games) {
    socket.on("player-join", ({ playerName, playerId }) => {
        let player;
        
        if (playerId && this.players[playerId]) {
            // Existing player reconnecting
            player = this.players[playerId];
            player.socketId = socket.id;
            player.isConnected = true;
        } else {
            // New player registration
            player = {
                id: generateUUID(),
                name: playerName,
                socketId: socket.id,
                isConnected: true,
                lastSeen: Date.now()
            };
            this.players[player.id] = player;
        }
        
        socket.playerId = player.id;
        socket.emit("player-joined", player);
    });
}
```

**Disconnection Handling**
```javascript
onDisconnect(socket, games) {
    socket.on("disconnect", (reason) => {
        const playerId = socket.playerId;
        if (!playerId || !this.players[playerId]) return;
        
        const player = this.players[playerId];
        player.isConnected = false;
        player.lastSeen = Date.now();
        
        // Handle game disconnection
        if (player.roomId && games[player.roomId]) {
            const game = games[player.roomId];
            socket.to(player.roomId).emit("player-disconnected", {
                playerId,
                playerName: player.name
            });
        }
    });
}
```

### Game Handler (gameHandlers.js)

Manages game creation, moves, and game state transitions.

```javascript
export class gameFunctions {
    constructor(players, games, timers) {
        this.players = players;
        this.games = games;
        this.timers = timers;
    }

    createGame(socket) {
        socket.on("create-game", (data) => {
            // Create new game room
        });
    }

    joinGame(socket) {
        socket.on("join-game", (data) => {
            // Join existing game room
        });
    }

    makeMove(socket) {
        socket.on("make-move", (data) => {
            // Process chess moves
        });
    }

    // Additional game control methods...
}
```

#### Key Game Methods

**Game Creation**
```javascript
createGame(socket) {
    socket.on("create-game", ({ gameOptions }) => {
        const playerId = socket.playerId;
        if (!playerId || !this.players[playerId]) {
            return socket.emit("error", { message: "Player not found" });
        }
        
        const roomId = generateRoomId();
        const game = {
            roomId,
            players: {
                white: {
                    id: playerId,
                    name: this.players[playerId].name,
                    socketId: socket.id
                },
                black: null
            },
            gameState: "waiting",
            chess: new Chess(),
            currentTurn: "white",
            moveHistory: [],
            createdAt: Date.now(),
            gameOptions: gameOptions || getDefaultGameOptions(),
            timers: {
                white: (gameOptions?.timeControl || 10) * 60 * 1000,
                black: (gameOptions?.timeControl || 10) * 60 * 1000,
                lastMoveTime: null
            }
        };
        
        this.games[roomId] = game;
        this.players[playerId].roomId = roomId;
        
        socket.join(roomId);
        socket.emit("game-created", { roomId, gameOptions });
    });
}
```

**Move Processing**
```javascript
makeMove(socket) {
    socket.on("make-move", ({ from, to, promotion }) => {
        const playerId = socket.playerId;
        const player = this.players[playerId];
        
        if (!player?.roomId) {
            return socket.emit("invalid-move", { message: "Not in a game" });
        }
        
        const game = this.games[player.roomId];
        if (!game || game.gameState !== "active") {
            return socket.emit("invalid-move", { message: "Game not active" });
        }
        
        // Validate turn
        const playerColor = this.getPlayerColor(playerId, game);
        if (playerColor !== game.currentTurn) {
            return socket.emit("invalid-move", { message: "Not your turn" });
        }
        
        // Attempt move
        try {
            const move = game.chess.move({ from, to, promotion });
            if (!move) {
                return socket.emit("invalid-move", { message: "Illegal move" });
            }
            
            // Update game state
            game.currentTurn = game.chess.turn() === 'w' ? 'white' : 'black';
            game.moveHistory.push(move);
            game.timers.lastMoveTime = Date.now();
            
            // Check for game end conditions
            const gameStatus = this.checkGameEnd(game);
            
            // Emit move to all players in room
            global.io.to(player.roomId).emit("move-made", {
                move,
                board: game.chess.fen(),
                currentTurn: game.currentTurn,
                gameState: game.gameState,
                moveHistory: game.moveHistory,
                isCheck: game.chess.inCheck(),
                isCheckmate: game.chess.isCheckmate(),
                isStalemate: game.chess.isStalemate(),
                gameStatus
            });
            
            // Update timers
            this.updateGameTimer(game);
            
        } catch (error) {
            socket.emit("invalid-move", { message: "Invalid move format" });
        }
    });
}
```

**Game End Detection**
```javascript
checkGameEnd(game) {
    if (game.chess.isCheckmate()) {
        const winner = game.currentTurn === "white" ? "black" : "white";
        game.gameState = "finished";
        game.gameResult = {
            winner,
            reason: "checkmate",
            endTime: Date.now()
        };
        this.stopGameTimer(game.roomId);
        return { gameOver: true, result: "checkmate", winner };
    }
    
    if (game.chess.isStalemate()) {
        game.gameState = "finished";
        game.gameResult = {
            reason: "stalemate",
            endTime: Date.now()
        };
        this.stopGameTimer(game.roomId);
        return { gameOver: true, result: "stalemate" };
    }
    
    if (game.chess.isDraw()) {
        game.gameState = "finished";
        game.gameResult = {
            reason: "draw",
            endTime: Date.now()
        };
        this.stopGameTimer(game.roomId);
        return { gameOver: true, result: "draw" };
    }
    
    return { gameOver: false };
}
```

## Timer Management

### Timer System
Real-time game timers with increment support.

```javascript
class TimerManager {
    startGameTimer(game) {
        if (this.timers[game.roomId]) {
            this.stopGameTimer(game.roomId);
        }
        
        const timer = {
            roomId: game.roomId,
            isActive: true,
            currentPlayer: game.currentTurn,
            lastUpdateTime: Date.now(),
            intervalId: setInterval(() => {
                this.updateTimer(game);
            }, 1000)
        };
        
        this.timers[game.roomId] = timer;
    }
    
    updateTimer(game) {
        const now = Date.now();
        const timer = this.timers[game.roomId];
        
        if (!timer?.isActive) return;
        
        const timeElapsed = now - timer.lastUpdateTime;
        const currentPlayerTime = game.timers[timer.currentPlayer];
        
        game.timers[timer.currentPlayer] = Math.max(0, currentPlayerTime - timeElapsed);
        timer.lastUpdateTime = now;
        
        // Emit timer update
        global.io.to(game.roomId).emit("timer-update", {
            white: { timeRemaining: game.timers.white },
            black: { timeRemaining: game.timers.black }
        });
        
        // Check for timeout
        if (game.timers[timer.currentPlayer] <= 0) {
            this.handleTimeout(game, timer.currentPlayer);
        }
    }
    
    handleTimeout(game, playerColor) {
        const winner = playerColor === "white" ? "black" : "white";
        
        game.gameState = "finished";
        game.gameResult = {
            winner,
            reason: "timeout",
            timeoutBy: playerColor,
            endTime: Date.now()
        };
        
        global.io.to(game.roomId).emit("game-over", {
            result: "timeout",
            winner,
            timeoutBy: playerColor
        });
        
        this.stopGameTimer(game.roomId);
    }
}
```

## Error Handling

### Socket Error Patterns
```javascript
// Centralized error handling
const handleSocketError = (socket, error, context) => {
    console.error(`Socket error in ${context}:`, error);
    socket.emit("error", {
        type: error.type || "UNKNOWN_ERROR",
        message: error.message || "An unexpected error occurred",
        context
    });
};

// Usage in handlers
socket.on("join-game", (data) => {
    try {
        // Game joining logic
    } catch (error) {
        handleSocketError(socket, error, "join-game");
    }
});
```

### Validation Middleware
```javascript
const validateGameAction = (socket, requiredGameState = null) => {
    const playerId = socket.playerId;
    const player = this.players[playerId];
    
    if (!player) {
        socket.emit("error", { message: "Player not authenticated" });
        return null;
    }
    
    if (!player.roomId) {
        socket.emit("error", { message: "Not in a game room" });
        return null;
    }
    
    const game = this.games[player.roomId];
    if (!game) {
        socket.emit("error", { message: "Game not found" });
        return null;
    }
    
    if (requiredGameState && game.gameState !== requiredGameState) {
        socket.emit("error", { 
            message: `Game must be in ${requiredGameState} state` 
        });
        return null;
    }
    
    return { player, game };
};
```

## Connection Management

### Reconnection Handling
```javascript
handleReconnection(socket, playerId, games) {
    const player = this.players[playerId];
    if (!player) return false;
    
    // Update socket connection
    player.socketId = socket.id;
    player.isConnected = true;
    socket.playerId = playerId;
    
    // Rejoin game room if in active game
    if (player.roomId && games[player.roomId]) {
        const game = games[player.roomId];
        socket.join(player.roomId);
        
        // Send current game state
        socket.emit("game-rejoined", {
            gameData: this.getGameData(game),
            playerData: player
        });
        
        // Notify other players
        socket.to(player.roomId).emit("player-reconnected", {
            playerId,
            playerName: player.name
        });
        
        return true;
    }
    
    return false;
}
```

### Cleanup Utilities
```javascript
cleanupPlayer(playerId) {
    const player = this.players[playerId];
    if (!player) return;
    
    // Remove from game
    if (player.roomId && this.games[player.roomId]) {
        this.removePlayerFromGame(player.roomId, playerId);
    }
    
    // Remove player record
    delete this.players[playerId];
}

cleanupGame(roomId) {
    const game = this.games[roomId];
    if (!game) return;
    
    // Stop timers
    this.stopGameTimer(roomId);
    
    // Remove players from room
    if (game.players.white?.id) {
        const whitePlayer = this.players[game.players.white.id];
        if (whitePlayer) whitePlayer.roomId = null;
    }
    
    if (game.players.black?.id) {
        const blackPlayer = this.players[game.players.black.id];
        if (blackPlayer) blackPlayer.roomId = null;
    }
    
    // Remove game record
    delete this.games[roomId];
}
```

## Security Considerations

### Input Validation
```javascript
const validateMoveInput = (moveData) => {
    if (!moveData || typeof moveData !== 'object') {
        return { valid: false, error: "Invalid move data" };
    }
    
    const { from, to, promotion } = moveData;
    
    // Validate square notation
    const squareRegex = /^[a-h][1-8]$/;
    if (!squareRegex.test(from) || !squareRegex.test(to)) {
        return { valid: false, error: "Invalid square notation" };
    }
    
    // Validate promotion piece
    if (promotion && !['q', 'r', 'b', 'n'].includes(promotion)) {
        return { valid: false, error: "Invalid promotion piece" };
    }
    
    return { valid: true };
};
```

### Rate Limiting
```javascript
const rateLimiter = new Map();

const checkRateLimit = (socketId, action, limit = 10, window = 60000) => {
    const key = `${socketId}:${action}`;
    const now = Date.now();
    
    if (!rateLimiter.has(key)) {
        rateLimiter.set(key, { count: 1, resetTime: now + window });
        return true;
    }
    
    const data = rateLimiter.get(key);
    
    if (now > data.resetTime) {
        data.count = 1;
        data.resetTime = now + window;
        return true;
    }
    
    if (data.count >= limit) {
        return false;
    }
    
    data.count++;
    return true;
};
```

## Monitoring and Logging

### Structured Logging
```javascript
const logger = {
    info: (message, data = {}) => {
        console.log(JSON.stringify({
            level: 'INFO',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    },
    
    error: (message, error = {}, data = {}) => {
        console.error(JSON.stringify({
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            message,
            error: error.message || error,
            stack: error.stack,
            ...data
        }));
    }
};

// Usage
logger.info("Game created", { roomId, playerId });
logger.error("Move validation failed", error, { playerId, move });
```

### Metrics Collection
```javascript
const metrics = {
    activeGames: () => Object.keys(games).length,
    activePlayers: () => Object.values(players).filter(p => p.isConnected).length,
    totalMoves: () => Object.values(games).reduce((sum, game) => 
        sum + game.moveHistory.length, 0
    )
};

// Periodic metrics reporting
setInterval(() => {
    logger.info("Server metrics", metrics);
}, 60000); // Every minute
```

This backend architecture provides a robust foundation for real-time multiplayer chess with proper error handling, security considerations, and scalability patterns.