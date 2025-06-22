import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Board } from "./components/ChessBoard";
import { Navbar } from "./components/Navbar";
import { Menu } from "./components/Menu";
import { Footer } from "./components/Footer";
import { Timer } from "./components/Timer";
import { usePlayerContext, useGameContext, useTimerContext } from "./context/index.jsx";
import { useSocketEmit } from "./hooks/useSocketEmit";
import { useSocketEvent } from "./hooks/useSocketEvent";

// Import motion (motion.dev)
import { AnimatePresence, motion } from "motion/react";

const url = "localhost:3000";

function App() {
    const [socket, setSocket] = useState(null);

    // Layout state
    const [layoutView, setLayoutView] = useState("landing"); // "landing" or "game"
    const [menuView, setMenuView] = useState("default"); // "default", "newGameOptions", etc.

    const { playerId, setPlayerId, playerData, setPlayerData } = usePlayerContext();
    const { gameState, updateGameState } = useGameContext();
    const { setWhiteTime, setBlackTime, setCurrentTurn } = useTimerContext();

    useEffect(() => {
        if (!socket) {
            const socketInstance = io(url);
            setSocket(socketInstance);
            socketInstance.on("connect", () => {
                console.log("Socket connected:", socketInstance.id);
            });
            return () => {
                socketInstance.disconnect();
                console.log("Socket disconnected");
            };
        }
    }, [setSocket]);

    const emitEvent = useSocketEmit(socket);

    if (playerId) emitEvent("playerReconnected", { playerId });

    useSocketEvent(socket, "connect", () => {
        emitEvent("onPlayerJoin", { playerId: "" });
    });

    useSocketEvent(socket, "playerId", (newPlayerId) => {
        setPlayerId(newPlayerId);
        localStorage.setItem("playerId", JSON.stringify(newPlayerId));
        emitEvent("playerData", { playerId: newPlayerId });
    });
    useSocketEvent(socket, "playerDataResponse", (data) => setPlayerData(data));
    useSocketEvent(socket, "playerNotFound", () => {
        localStorage.removeItem("playerId");
        setPlayerId(null);
        setPlayerData({});
    });

    useSocketEvent(socket, "playerDisconnected", (gameData) => {
        updateGameState({ gameStatus: gameData["gameStatus"] });
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
        localStorage.removeItem("playerId");
    });

    // Layout/menu transitions based on gameState
    useEffect(() => {
        if (
            ["playing", "room full", "waiting for reconnection"].includes(gameState.gameStatus)
        ) {
            setLayoutView("game");
            setMenuView("inGameOptions");
        } else if (
            gameState.gameStatus === "not started" ||
            gameState.gameStatus === undefined
        ) {
            setLayoutView("landing");
            setMenuView("default");
        }
    }, [gameState.gameStatus]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            emitEvent("Disconnect", { playerId });
            if (playerData["gameId"] === null) {
                localStorage.removeItem("playerId");
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [playerId, emitEvent]);

    // Animation variants
    const menuVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: "easeInOut" },
    };

    return (
        <div className="flex flex-col h-full min-h-screen">
            {/* Animate Navbar and Footer */}
            <AnimatePresence>
                {layoutView === "landing" && (
                    <motion.div
                        key="navbar"
                        initial={{ opacity: 0, y: -24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -24 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Navbar />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex flex-col flex-1 items-center justify-center overflow-hidden box-border md:flex-row">
                {/* Board never remounts */}
                <Board
                    socket={socket}
                    classes="flex justify-center items-center h-[100%] flex-35/100"
                />
                {/* Timer only shows in 'game' layout, with animation */}
                <AnimatePresence mode="wait">
                    {layoutView === "game" && (
                        <motion.div
                            key="timer"
                            initial={{ opacity: 0, y: -40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col justify-center items-center flex-20/100 h-[100%]"
                        >
                            <Timer socket={socket} classes="flex flex-col justify-center items-center h-full border-2xl border-border text-accent-foreground dark gap-3" />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Menu panel animates between states */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={menuView + layoutView}
                        initial={menuVariants.initial}
                        animate={menuVariants.animate}
                        exit={menuVariants.exit}
                        transition={menuVariants.transition}
                        className="flex flex-45/100 flex-col justify-center items-center h-[100%]"
                    >
                        <Menu
                            socket={socket}
                            classes=""
                            menuView={menuView}
                            setMenuView={setMenuView}
                            layoutView={layoutView}
                            setLayoutView={setLayoutView}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {layoutView === "landing" && (
                    <motion.div
                        key="footer"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Footer />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;