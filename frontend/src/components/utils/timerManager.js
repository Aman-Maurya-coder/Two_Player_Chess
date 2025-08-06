class TimerManager {
    constructor() {
        this.listeners = new Set();
        this.whiteTime = 300000;
        this.blackTime = 300000;
        this.currentTurn = 'white';
        this.pendingUpdate = null; // Store pending updates
    }

    subscribe(callback) {
        this.listeners.add(callback);
        
        // If there's a pending update, apply it immediately
        if (this.pendingUpdate) {
            callback(this.pendingUpdate);
            this.pendingUpdate = null;
        }
        return () => this.listeners.delete(callback);
    }

    notify() {
        if (this.listeners.size === 0) {
            // Store the update if no listeners yet
            this.pendingUpdate = {
                whiteTime: this.whiteTime,
                blackTime: this.blackTime,
                currentTurn: this.currentTurn
            };
        } else {
            this.listeners.forEach(callback => callback({
                whiteTime: this.whiteTime,
                blackTime: this.blackTime,
                currentTurn: this.currentTurn
            }));
        }
    }

    updateTime(whiteTime, blackTime, currentTurn) {
        this.whiteTime = whiteTime;
        this.blackTime = blackTime;
        this.currentTurn = currentTurn;
        this.notify();
    }

    // Add a public reset method
    reset() {
        this.whiteTime = 300000;
        this.blackTime = 300000;
        this.currentTurn = 'white';
        this.notify();
    }

    // Add a method to set specific timer values
    setTimerValues(whiteTime, blackTime, currentTurn = 'white') {
        this.whiteTime = whiteTime;
        this.blackTime = blackTime;
        this.currentTurn = currentTurn;
        this.notify();
    }

    initializeSocket(socket) {
        if (!socket) return;

        const handleTimeUpdate = ({ whiteTime, blackTime, currentTurn }) => {
            this.updateTime(whiteTime, blackTime, currentTurn);
        };

        const handleIncrementedTime = ({ whiteTime, blackTime, currentTurn }) => {
            this.updateTime(whiteTime, blackTime, currentTurn);
        };

        const handleGameTimeout = ({ loser, winner, reason }) => {
            alert(`${loser} lost on time! ${winner} wins!`);
        };

        const handlePlayerReconnected = (gameData, timeData) => {
            if (timeData) {
                this.updateTime(timeData.whiteTime, timeData.blackTime, timeData.currentTurn);
            }
        };

        const handleGameRoomCreated = ({ gameData }) => {
            this.updateTime(
                gameData.gameTimer.white,
                gameData.gameTimer.black,
                gameData.roomPlayers.white === null ? "black" : "white"
            );
        };
        // Handle room joined (for second player joining)
        const handleRoomJoined = ({ gameId, gameStatus, timeControl }) => {
            console.log("TimerManager - roomJoined received:", { gameId, gameStatus, timeControl });
            if (timeControl) {
                console.log("TimerManager - Updating timer from roomJoined:", timeControl);
                this.updateTime(timeControl, timeControl, 'white');
            }
        };

        // Handle when another player joins your room (for room creator when 2nd player joins)
        const handlePlayerJoinedRoom = ({ gameId, gameStatus }) => {
            console.log("TimerManager - playerJoinedRoom received:", { gameId, gameStatus });
            // This event doesn't contain timer data, so we don't update timer here
            // The timer should already be set from gameRoomCreated
        };

        const handleMoveMade = ({ currentTurn }) => {
            this.updateTime(this.whiteTime, this.blackTime, currentTurn);
        };

        const handlePlayerRejoinedRoom = (playerData, gameData) => {
            const currentTurn = gameData.game._turn === "w" ? "white" : "black";
            this.updateTime(
                gameData.gameTimer.white,
                gameData.gameTimer.black,
                currentTurn
            );
        };

        const handlePlayerRejoinedGame = ({ playerData, gameData }) => {
            const currentTurn = gameData.game._turn === "w" ? "white" : "black";
            this.updateTime(
                gameData.gameTimer.white,
                gameData.gameTimer.black,
                currentTurn
            );
        };

        const handleGameReset = ({ gameData }) => {
            // Use the new setTimerValues method instead of undefined functions
            this.setTimerValues(
                gameData["time"] * 60 * 1000,
                gameData["time"] * 60 * 1000,
                "white"
            );
        };

        // Add all listeners
        socket.on("gameRoomCreated", handleGameRoomCreated);
        socket.on("roomJoined", handleRoomJoined);
        socket.on("playerJoinedRoom", handlePlayerJoinedRoom);
        socket.on("timeUpdate", handleTimeUpdate);
        socket.on("incrementedTime", handleIncrementedTime);
        socket.on("gameTimeout", handleGameTimeout);
        socket.on("playerReconnected", handlePlayerReconnected);
        socket.on("moveMade", handleMoveMade);
        socket.on("playerRejoinedRoom", handlePlayerRejoinedRoom);
        socket.on("playerRejoinedGame", handlePlayerRejoinedGame);
        socket.on("gameResetSuccessful", handleGameReset);

        return () => {
            socket.off("timeUpdate", handleTimeUpdate);
            socket.off("incrementedTime", handleIncrementedTime);
            socket.off("gameTimeout", handleGameTimeout);
            socket.off("playerReconnected", handlePlayerReconnected);
            socket.off("gameRoomCreated", handleGameRoomCreated);
            socket.off("moveMade", handleMoveMade);
            socket.off("playerRejoinedRoom", handlePlayerRejoinedRoom);
            socket.off("playerRejoinedGame", handlePlayerRejoinedGame);
            socket.off("gameResetSuccessful", handleGameReset);
        };
    }
}

export const timerManager = new TimerManager();