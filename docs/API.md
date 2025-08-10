# API Documentation

This document describes the Socket.io events and their schemas used for real-time communication between the client and server.

## Overview

The Two Player Chess application uses Socket.io for bidirectional real-time communication. Events are organized into two main categories:

- **Player Events**: Handle player management, joining, and reconnection
- **Game Events**: Handle game creation, moves, and game state management

## Connection

### Client Connection
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
});
```

### Server Configuration
The server accepts connections from configured origins with CORS support.

## Player Events

### player-join
Emitted when a player joins the application.

**Client → Server**
```javascript
socket.emit("player-join", {
    playerName: string,
    playerId?: string // optional, for reconnecting players
});
```

**Server → Client**
```javascript
socket.on("player-joined", (data) => {
    // data: {
    //     playerId: string,
    //     playerName: string,
    //     roomId?: string // if rejoining an existing game
    // }
});
```

### get-player-data
Request current player data from server.

**Client → Server**
```javascript
socket.emit("get-player-data");
```

**Server → Client**
```javascript
socket.on("player-data", (data) => {
    // data: {
    //     playerId: string,
    //     playerName: string,
    //     roomId?: string,
    //     gameState?: object
    // }
});
```

### rejoin-game
Rejoin a game after disconnection.

**Client → Server**
```javascript
socket.emit("rejoin-game", {
    roomId: string,
    playerId: string
});
```

**Server → Client**
```javascript
socket.on("rejoin-success", (gameData) => {
    // gameData: complete game state object
});

socket.on("rejoin-failed", (error) => {
    // error: { message: string }
});
```

### rejoin-cancel
Cancel a rejoin attempt.

**Client → Server**
```javascript
socket.emit("rejoin-cancel");
```

## Game Events

### create-game
Create a new game room.

**Client → Server**
```javascript
socket.emit("create-game", {
    gameOptions: {
        timeControl: number, // minutes per player
        increment: number,   // seconds added per move
        variant: string      // "standard", "rapid", "blitz"
    }
});
```

**Server → Client**
```javascript
socket.on("game-created", (data) => {
    // data: {
    //     roomId: string,
    //     gameOptions: object,
    //     createdBy: string,
    //     createdAt: timestamp
    // }
});
```

### join-game
Join an existing game room.

**Client → Server**
```javascript
socket.emit("join-game", {
    roomId: string
});
```

**Server → Client**
```javascript
socket.on("game-joined", (gameData) => {
    // gameData: {
    //     roomId: string,
    //     players: {
    //         white: { id: string, name: string },
    //         black: { id: string, name: string }
    //     },
    //     gameState: "waiting" | "active" | "finished",
    //     currentTurn: "white" | "black",
    //     board: string, // FEN notation
    //     moveHistory: array,
    //     gameOptions: object
    // }
});

socket.on("join-failed", (error) => {
    // error: { message: string }
});
```

### get-room-data
Get information about a specific room.

**Client → Server**
```javascript
socket.emit("get-room-data", {
    roomId: string
});
```

**Server → Client**
```javascript
socket.on("room-data", (data) => {
    // data: {
    //     roomId: string,
    //     playerCount: number,
    //     gameState: string,
    //     isJoinable: boolean
    // }
});
```

### get-game-data
Get complete game state.

**Client → Server**
```javascript
socket.emit("get-game-data");
```

**Server → Client**
```javascript
socket.on("game-data", (gameData) => {
    // Complete game state object
});
```

### make-move
Make a chess move.

**Client → Server**
```javascript
socket.emit("make-move", {
    from: string,    // e.g., "e2"
    to: string,      // e.g., "e4"
    promotion?: string // "q", "r", "b", "n" for pawn promotion
});
```

**Server → Client**
```javascript
socket.on("move-made", (data) => {
    // data: {
    //     move: { from: string, to: string, piece: string, ... },
    //     board: string, // Updated FEN
    //     currentTurn: string,
    //     gameState: string,
    //     moveHistory: array,
    //     isCheck: boolean,
    //     isCheckmate: boolean,
    //     isStalemate: boolean
    // }
});

socket.on("invalid-move", (error) => {
    // error: { message: string }
});
```

### Game Control Events

#### abort-game
Abort the current game.

**Client → Server**
```javascript
socket.emit("abort-game");
```

**Server → Client**
```javascript
socket.on("game-aborted", (data) => {
    // data: { reason: "aborted", abortedBy: string }
});
```

#### resign-game
Resign from the current game.

**Client → Server**
```javascript
socket.emit("resign-game");
```

**Server → Client**
```javascript
socket.on("game-over", (data) => {
    // data: {
    //     result: "resign",
    //     winner: string,
    //     resignedBy: string
    // }
});
```

#### offer-draw
Offer a draw to the opponent.

**Client → Server**
```javascript
socket.emit("offer-draw");
```

**Server → Client**
```javascript
socket.on("draw-offered", (data) => {
    // data: { offeredBy: string }
});
```

#### accept-draw / reject-draw
Respond to a draw offer.

**Client → Server**
```javascript
socket.emit("accept-draw");
// or
socket.emit("reject-draw");
```

**Server → Client**
```javascript
socket.on("draw-accepted", (data) => {
    // data: { result: "draw", reason: "agreement" }
});

socket.on("draw-rejected", (data) => {
    // data: { rejectedBy: string }
});
```

#### play-again
Request to play another game.

**Client → Server**
```javascript
socket.emit("play-again");
```

**Server → Client**
```javascript
socket.on("play-again-requested", (data) => {
    // data: { requestedBy: string }
});
```

#### accept-play-again / reject-play-again
Respond to play again request.

**Client → Server**
```javascript
socket.emit("accept-play-again");
// or  
socket.emit("reject-play-again");
```

**Server → Client**
```javascript
socket.on("new-game-started", (gameData) => {
    // New game state with same players
});

socket.on("play-again-rejected", (data) => {
    // data: { rejectedBy: string }
});
```

#### close-room
Close the game room.

**Client → Server**
```javascript
socket.emit("close-room");
```

**Server → Client**
```javascript
socket.on("room-closed", (data) => {
    // data: { closedBy: string }
});
```

## Timer Events

### timer-update
Real-time timer updates during active games.

**Server → Client**
```javascript
socket.on("timer-update", (data) => {
    // data: {
    //     white: { timeRemaining: number }, // milliseconds
    //     black: { timeRemaining: number }
    // }
});
```

### time-out
Emitted when a player runs out of time.

**Server → Client**
```javascript
socket.on("game-over", (data) => {
    // data: {
    //     result: "timeout",
    //     winner: string,
    //     timeoutBy: string
    // }
});
```

## Error Handling

### Generic Error Events

**Server → Client**
```javascript
socket.on("error", (error) => {
    // error: {
    //     type: string,
    //     message: string,
    //     code?: number
    // }
});
```

### Common Error Types

- `ROOM_NOT_FOUND` - Room does not exist
- `ROOM_FULL` - Room is already full
- `INVALID_MOVE` - Chess move is not legal
- `NOT_YOUR_TURN` - Player tried to move out of turn
- `GAME_NOT_ACTIVE` - Action requires an active game
- `PLAYER_NOT_IN_GAME` - Player is not part of the game

## Example Usage

### Complete Game Flow

```javascript
// 1. Join as player
socket.emit("player-join", { playerName: "Alice" });

// 2. Create a game
socket.emit("create-game", {
    gameOptions: {
        timeControl: 10,
        increment: 0,
        variant: "blitz"
    }
});

// 3. Share room ID with friend
socket.on("game-created", (data) => {
    console.log("Share this room ID:", data.roomId);
});

// 4. Friend joins
socket.emit("join-game", { roomId: "room-id-here" });

// 5. Make moves
socket.emit("make-move", { from: "e2", to: "e4" });

// 6. Listen for game updates
socket.on("move-made", (data) => {
    // Update UI with new board state
});

// 7. Handle game end
socket.on("game-over", (data) => {
    console.log("Game ended:", data.result);
});
```

## Testing Events

For testing, you can use the Socket.io admin UI available at:
`https://admin.socket.io`

Configure the server URL to monitor real-time events and connections.