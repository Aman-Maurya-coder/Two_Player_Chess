import "./App.css";
import { io } from "socket.io-client";
import { Board } from "./components/ChessBoard";
import { Navbar } from "./components/Navbar";
import { Menu } from "./components/Menu";
import { Footer } from "./components/Footer";
import { GameOverPopup } from "./components/GameOverPopup";
import {
    usePlayerContext,
    useGameContext,
    useTimerContext
} from "./context/index.jsx";
import { useState, useEffect } from "react";
import { useSocketEmit } from "./hooks/useSocketEmit";
import { useSocketEvent } from "./hooks/useSocketEvent";

const url = "localhost:3000";

// let socket;

//NOTE: Two players are joining but second player's screen is not showing the correct info.
//NOTE: in backend this.players.entries is not a function in joinRoom method.

function App() {
    const [socket, setSocket] = useState(null);
    // console.log(socket);
    const { playerId, setPlayerId, playerData, setPlayerData } = usePlayerContext();
    const { gameState, updateGameState } = useGameContext();
    const { setWhiteTime, setBlackTime, setCurrentTurn } = useTimerContext();
    
    useEffect(() => {
        if (!socket) {
            const socketInstance = io(url);
            setSocket(socketInstance);
            socketInstance.on("connect", () => {
                console.log("Socket connected:", socketInstance.id);

                // if (!playerId) {
                //     socketInstance.emit("onPlayerJoin"); // Emit directly if no playerId
                // }
            });
            return () => {
                socketInstance.disconnect();
                console.log("Socket disconnected");
            };
        }
    }, [setSocket]);

    const emitEvent = useSocketEmit(socket);
    if(playerId){
        emitEvent("playerReconnected", { playerId });
    }
    
    useSocketEvent(socket, "connect", () => {
        console.log("Socket connected:", socket);
        // setSocket(socketInstance);  
        // Emit an event to notify the server that a new client has connected
        emitEvent("onPlayerJoin",{
            "playerId": ""
        });
    }); 

    useSocketEvent(socket, "playerId", (newPlayerId) => {
        setPlayerId(newPlayerId);
        localStorage.setItem("playerId", JSON.stringify(newPlayerId));
        console.log("Player ID set:", newPlayerId);
        emitEvent("playerData", { "playerId":newPlayerId });
    })
    useSocketEvent(socket, "playerDataResponse", (data) => {
        setPlayerData(data);
        console.log("Player data received:", data);
    })
    useSocketEvent(socket, "playerNotFound", () => {
        console.error("Player not found");
        localStorage.removeItem("playerId");
        setPlayerId(null);
        setPlayerData({});
    })

    useSocketEvent(socket, "playerDisconnected", ({gameData})=>{
        console.log("Other player left the game");
        updateGameState({
            "gameStatus": gameData["gameStatus"],
        })
    })

    useSocketEvent(socket, "playerReconnected", (gameData, timeData) => {
        updateGameState({
            gameStatus: gameData.gameStatus,
            moveNumber: gameData.moveNumber,
            timeData: timeData
        })
        setWhiteTime(timeData.whiteTime);
        setBlackTime(timeData.blackTime);
        setCurrentTurn(timeData.currentTurn);
    })

    useSocketEvent(socket, "reconnectionFailed", (error) => {
        console.error("Reconnection failed:", error);
        localStorage.removeItem("playerId");
    })

    useEffect(() => {
        const handleBeforeUnload = (event) =>{
            emitEvent("Disconnect", { playerId });
            if (playerData["gameId"] === null){
                localStorage.removeItem("playerId");
                console.log("Player ID cleared from localStorage");
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        }
    }, [playerId, emitEvent]);
    return (
        <>
            <Navbar></Navbar>
            {/* {gameState.gameStatus !== "not started" || gameState.gameStatus !== "playing" && <GameOverPopup />} */}
            <div className="game">
                <Board
                    socket ={socket}
                    gameStatus={gameState.gameStatus}
                    onGameStatusChange={(status) => updateGameState({gameStauts: status})}
                    moveNumber={gameState.moveNumber}
                    setMoveNumber={(prevMoveNumber) => updateGameState({moveNumber: prevMoveNumber + 1})}
                />
                <Menu
                    socket={socket}
                />
            </div>
            <Footer></Footer>
        </>
    );
}

export default App;
