import { useState, useEffect, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
// import { Board } from "./components/ChessBoard";
import { Navbar } from "./components/Navbar";
import { Menu } from "./components/Menu";
// import { Footer } from "./components/Footer";
// import { Timer } from "./components/Timer";
import {usePlayerContext, useGameContext, useTimerContext } from "./context/index.jsx";
import { InGameOptions } from "./components/gameOptions/InGameOptions";
import { useSocketEmit } from "./hooks/useSocketEmit";
import { useSocketEvent } from "./hooks/useSocketEvent";

// Import motion (motion.dev)
import { AnimatePresence, motion } from "motion/react";
import { delay } from "motion";
import { Board } from "./components/ChessBoard";
// const url = "https://nrjrsvh4-3000.inc1.devtunnels.ms/" || "localhost:3000";
const url = "http://localhost:3000";

function App() {
    // const socket = io(url);
    const socket = useMemo(() => {
        return io(url, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
    }, []);

    const [isConnected, setIsConnected] = useState(false);
    const { playerId, setPlayerId, playerData, updatePlayerData } = usePlayerContext();
    const { gameState, updateGameState } = useGameContext();
    const { setWhiteTime, setBlackTime, setCurrentTurn } = useTimerContext();
    const [menuView, setMenuView] = useState("default"); // "default", "newGameOptions", etc.

    useEffect(() => {
        if (!socket) return;
        const handleConnect = () => {
            console.log("Socket connected:", socket.id);
            setIsConnected(true); // Update connection status
        };

        const handleConnectError = (error) => {
            console.error("Socket connection error:", error);
            setIsConnected(false); // Update connection status
        };

        const handleDisconnect = (reason) => {
            console.log("Socket disconnected", reason);
            // if( reason === "io server disconnect" || reason === "transport error") {
            //     localStorage.removeItem("playerId"); // Clear playerId on disconnect
            // }
            setIsConnected(false); // Update connection status
        };

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
            socket.off("disconnect", handleDisconnect);
        };
    },[socket]);
    const emitEvent = useSocketEmit(socket);

    useEffect(() => {
        if (!isConnected) return;

        if (playerId) {
            console.log("Emitting playerReconnected with playerId:", playerId);
            emitEvent("onPlayerJoin", { "playerId":playerId });
        } else {
            console.log("No playerId found, emitting onPlayerJoin with empty playerId");
            emitEvent("onPlayerJoin", { playerId: "" });
        }
    }, [isConnected]);
    
    // console.log(socket);
    // console.log(emitEvent)

    // // Layout state
    // const [layoutView, setLayoutView] = useState("landing"); // "landing" or "game"

    // if (!socket.connected) {
    //     console.error("Socket is not connected");
    //     return;
    // }
    // useSocketEvent(socket, "playerId", useCallback((newPlayerId) => {
    //     setPlayerId(newPlayerId);
    //     localStorage.setItem("playerId", JSON.stringify(newPlayerId));
    //     emitEvent("playerData", { playerId: newPlayerId });
    // },[]));
    useSocketEvent(socket, "playerId", (newPlayerId) => {
        console.log("Player ID received:", newPlayerId);
        setPlayerId(newPlayerId);
        localStorage.setItem("playerId", JSON.stringify(newPlayerId));
        emitEvent("playerData", { playerId: newPlayerId });
    });
    useSocketEvent(socket, "playerDataResponse", (data) => {
        console.log("Player data received:", data);
        updatePlayerData(data);
    });
    useSocketEvent(socket, "playerNotFound", () => {
        console.log("Player not found");
        localStorage.removeItem("playerId");
        setPlayerId(null);
        updatePlayerData({});
    });
    useSocketEvent(socket, "playerReconnected", (gameData, timeData) => {
        updateGameState({
            gameStatus: gameData.gameStatus,
            moveNumber: gameData.moveNumber,
            timeData: timeData,
        });
        setWhiteTime(timeData.whiteTime);
        setBlackTime(timeData.blackTime);
        setCurrentTurn(timeData.currentTurn);
    });
    useSocketEvent(socket, "reconnectionFailed", (error) => {
        console.error("Reconnection failed:", error);
        localStorage.removeItem("playerId");
    });
    
    useEffect(() => {
        if (
            ["playing", "room full", "waiting for reconnection"].includes(gameState.gameStatus)
        ) {
            // setLayoutView("game");
            setMenuView("inGameOptions");
        } else if (
            gameState.gameStatus === "not started" ||
            gameState.gameStatus === undefined
        ) {
            // setLayoutView("landing");
            setMenuView("default");
        }
    }, [gameState.gameStatus]);
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log(playerData);
            console.log(gameState);
            if (playerData["gameId"] === null || gameState.gameStatus === "waiting for player 2" || gameState.gameStatus === "waiting for reconnection") {
                console.log("Removing playerId from localStorage before unload");
                localStorage.removeItem("playerId");
            }
            emitEvent("Disconnect", { playerId });
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [playerId, emitEvent]);
    if (!isConnected) {
        return <div>Connecting to the server...</div>;
    }

    return (
        <div id="main-app" className={`${ menuView !== "inGameOptions" ? "bg-background" : "bg-secondary-background"} h-full flex flex-col `}>
            <Navbar/>
            {menuView !== "inGameOptions" && (
                <div id="hero-container" className="flex-1 grid grid-rows-[1fr_1fr] grid-flow-col lg:grid-rows-1 lg:grid-cols-2 min-w-[360px] w-full">
                    <Menu 
                        socket={socket}
                        menuView={menuView}
                        setMenuView={setMenuView}
                    />
                    <div id="hero-image" className="flex items-center justify-center h-full lg:order-1">
                        <img src="../src/assets/hero_image.png" alt="chess image" width={821} height={380} className="" />
                    </div>
                </div>
            )}
            {menuView === "inGameOptions" && (
                <div id="game-container" className="flex-1 grid grid-rows-[1fr_calc(65%)_calc(30%)_1fr] grid-cols-[1fr_calc(90%)_1fr] bg-secondary-background">
                    <Board socket={socket} />
                    <InGameOptions socket={socket} menuView={menuView} setMenuView={setMenuView} />
                </div>
            )}
        </div>
    );
}

export default App;