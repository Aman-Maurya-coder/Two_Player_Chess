import { useState, useEffect, memo, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import { Navbar } from "./components/Navbar";
import { Menu } from "./components/Menu";
import { AlertDialogBox } from "./components/utils/AlertDialogBox";
import {usePlayerContext, useGameContext,useGameOptionsContext , useTimerContext } from "./context/index.jsx";
import { InGameOptions } from "./components/gameOptions/InGameOptions";
import { useSocketEmit } from "./hooks/useSocketEmit";
import { useSocketEvent } from "./hooks/useSocketEvent";
import { timerManager } from "./components/utils/timerManager";
import { Board } from "./components/ChessBoard";


// const url = "https://nrjrsvh4-3000.inc1.devtunnels.ms/";
const url = "http://localhost:3000";


export const App = memo(function App() {
    const socket = useMemo(() => {
        return io(url, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
    }, []);
    const askForRejoinRef = useRef(false);
    const [isConnected, setIsConnected] = useState(false);
    const { playerId, setPlayerId, playerData, updatePlayerData, resetPlayerData } = usePlayerContext();
    const { setGame, gameState, updateGameState, resetGameState } = useGameContext();
    const { updateGameOptions } = useGameOptionsContext();
    const [menuView, setMenuView] = useState("default"); // "default", "newGameOptions", etc.
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [alertDialogContent, setAlertDialogContent] = useState({
        title: "Sure?",
        desc: "Are you sure you want to do this?",
        action: "Confirm",
        onAction: () => {},
        onClose: () => setIsAlertDialogOpen(false),
    });

    useEffect(() => {
        if (!socket) return;
        const handleConnect = () => {
            console.log("Socket connected:", socket.id);
            setIsConnected(true);
        };

        const handleConnectError = (error) => {
            console.error("Socket connection error:", error);
            setIsConnected(false);
        };

        const handleDisconnect = (reason) => {
            console.log("Socket disconnected", reason);
            setIsConnected(false);
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
        if (!socket) return;
        
        const cleanup = timerManager.initializeSocket(socket);
        return cleanup;
    }, [socket]);

    useEffect(() => {
        if (!isConnected) return;

        if (playerId) {
            console.log("Reconnecting player with playerId:", playerId);
            emitEvent("onPlayerJoin", { "playerId":playerId });
            emitEvent("playerData", { playerId });
        } else {
            console.log("No playerId found, emitting onPlayerJoin with empty playerId");
            emitEvent("onPlayerJoin", { playerId: "" });
        }
    }, [isConnected]);

    useSocketEvent(socket, "playerId", (newPlayerId) => {
        console.log("Player ID received:", newPlayerId);
        setPlayerId(newPlayerId);
        localStorage.setItem("playerId", JSON.stringify(newPlayerId));
        emitEvent("playerData", { "playerId": newPlayerId });
    });

    useSocketEvent(socket, "playerDataResponse", (data) => {
        console.log("Player data received:", data);
        updatePlayerData(data);

        if (askForRejoinRef.current && data && data.gameId){
            askForRejoinRef.current = false; 

            setTimeout(() => {
                setAlertDialogContent({
                    title: "Rejoin Game",
                    desc: "You were disconnected. Do you want to rejoin the game?",
                    action: "Rejoin",
                    onAction: () => {
                        console.log("rejoining the game from playerDataResponse", data["gameId"]);
                        emitEvent("rejoinGame", { "playerId":playerId , "gameId": data.gameId });
                        setIsAlertDialogOpen(false);
                    },
                    onClose: () => {
                        setIsAlertDialogOpen(false);
                        emitEvent("rejoinCancel", { playerId, gameId: data.gameId });cancellation
                        resetPlayerData(); 
                        resetGameState(); 
                    },
                })
                setIsAlertDialogOpen(true);
            }, 0);
        }
    });

    useSocketEvent(socket, "askForRejoin", () => {
        askForRejoinRef.current = true;

        if (playerData && playerData.gameId){
            askForRejoinRef.current = false; 
            setAlertDialogContent({
                title: "Rejoin Game",
                desc: "You were disconnected. Do you want to rejoin the game?",
                action: "Rejoin",
                onAction: () => {
                    console.log("rejoining the game from askForRejoin", playerData["gameId"]);
                    emitEvent("rejoinGame", { "playerId":playerId , "gameId": playerData.gameId });
                    setIsAlertDialogOpen(false);
                },
                onClose: () => {
                    setIsAlertDialogOpen(false);
                    emitEvent("rejoinCancel", { playerId, gameId: playerData.gameId }); 
                    resetPlayerData(); 
                    resetGameState(); 
                },
            })
            setIsAlertDialogOpen(true);
        }
        
    })

    useSocketEvent(socket, "playerRejoinedRoom", (playerData, gameData) => {
        console.log("Player rejoined room:", playerData);
        updateGameState({
            gameId: gameData.gameId,
            gameStatus: gameData.gameStatus,
            moveNumber: gameData.moveNumber,
            timeData: gameData.gameTimer,
        })
        updateGameOptions({
            "time": gameData.timer,
            "increment": gameData.gameTimer.increment,
            "playerSide": playerId === gameData.roomPlayers.white ? "white" : "black",
        })
        updatePlayerData(playerData);
        setMenuView("inGameOptions");
        //Timer logic is in timerManager.jsx
    })

    useSocketEvent(socket, "playerRejoinedGame", ({playerData, gameData}) => {
        setGame(new Chess(gameData.gameFen));
        updateGameState({
            gameId: gameData.gameId,
            gameStatus: gameData.gameStatus,
            moveNumber: gameData.moveNumber,
            timeData: gameData.gameTimer,
        })
        updateGameOptions({
            "time": gameData.timer,
            "increment": gameData.gameTimer.increment,
            "playerSide": playerId === gameData.roomPlayers.white ? "white" : "black",
        })
        
        updatePlayerData(playerData);
        setMenuView("inGameOptions");
        //Timer logic is in timerManager.jsx
    })
    useSocketEvent(socket, "rejoinCanceled", (message) => {
        console.log(message);
        resetPlayerData(); 
        resetGameState();
    })

    useSocketEvent(socket, "playerNotFound", () => {
        console.log("Player not found");
        localStorage.removeItem("playerId");
        setPlayerId(null);
        updatePlayerData({});
    });
    useSocketEvent(socket, "playerDoesNotExist", () => {
        console.log("Player does not exist");
        localStorage.removeItem("playerId");
        setPlayerId(null);
        updatePlayerData({});
        emitEvent("onPlayerJoin", { playerId: "" });
    })
    useSocketEvent(socket, "playerReconnected", (gameData, timeData) => {
        updateGameState({
            gameStatus: gameData.gameStatus,
            moveNumber: gameData.moveNumber,
            timeData: timeData,
        });
        //Timer logic is in timerManager.jsx
    });
    useSocketEvent(socket, "reconnectionFailed", (error) => {
        console.error("Reconnection failed:", error);
        localStorage.removeItem("playerId");
    });
    
    useEffect(() => {
        if (
            ["playing", "room full", "waiting for reconnection"].includes(gameState.gameStatus)
        ) {
            setMenuView("inGameOptions");
        } else if (
            gameState.gameStatus === "not started" ||
            gameState.gameStatus === undefined
        ) {
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
            {console.log("rerendering App")}
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
                <div id="game-container" className="flex-1 grid grid-rows-[1fr_calc(60%)_calc(30%)_1fr] grid-cols-[1fr_calc(85%)_1fr] place-items-center md:grid-rows-[1fr_calc(80%)_1fr] md:grid-cols-[1fr_calc(47%)_calc(47%)_1fr] bg-secondary-background">
                    <Board socket={socket} />
                    <InGameOptions socket={socket} setMenuView={setMenuView} />
                </div>
            )}
            <AlertDialogBox
                dialogOpen={isAlertDialogOpen}
                setDialogOpen={setIsAlertDialogOpen}
                title={alertDialogContent.title}
                desc={alertDialogContent.desc}
                action={alertDialogContent.action}
                onAction={alertDialogContent.onAction}
                onClose={alertDialogContent.onClose}
            />
        </div>
    );
})

export default App;