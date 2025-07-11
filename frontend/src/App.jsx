import { useState, useEffect } from "react";
import { io } from "socket.io-client";
// import { Board } from "./components/ChessBoard";
import { Navbar } from "./components/Navbar";
import { Menu } from "./components/Menu";
// import { Footer } from "./components/Footer";
// import { Timer } from "./components/Timer";
import { usePlayerContext, useGameContext, useTimerContext } from "./context/index.jsx";
import { InGameOptions } from "./components/gameOptions/InGameOptions";
import { useSocketEmit } from "./hooks/useSocketEmit";
import { useSocketEvent } from "./hooks/useSocketEvent";

// Import motion (motion.dev)
import { AnimatePresence, motion } from "motion/react";
import { delay } from "motion";
import { Board } from "./components/ChessBoard";
const url = "https://nrjrsvh4-3000.inc1.devtunnels.ms/" || "localhost:3000";

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
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
        transition: { duration: 0.3, ease: "easeInOut"},
    };

    return (
        // <div id="main-app" style={{ height: "100vh" }} className="flex flex-col bg-background">
        //     {/* Animate Navbar and Footer */}
        //     {layoutView === "landing" && (
        //         <AnimatePresence>
        //             <motion.div
        //                 key="navbar"
        //                 initial={{ opacity: 0, y: -24 }}
        //                 animate={{ opacity: 1, y: 0 }}
        //                 exit={{ opacity: 0, y: -24 }}
        //                 transition={{ duration: 0.4}}
        //                 className="flex justify-center sticky  backdrop-blur-xs z-50 lg:absolute px-20 box-border top-0 w-full h-[5rem]"
        //                 id="navbar"
        //             >
        //                 <Navbar />
        //             </motion.div>
        //         </AnimatePresence>
        //     )}
        //     <div id="content" className="grid lg:flex lg:flex-1 sm:flex-col-reverse items-center box-border md:justify-center md:flex-1 lg:flex-row">
        //         {/* Board never remounts */}
        //         {/* <Board
        //             socket={socket}
        //             classes="flex justify-center h-[30rem] w-full items-center md:flex md:flex-1/2 md:h-full md:w-full lg:items-center"
        //         /> */}
        //         <img src="../src/assets/hero_image.png" alt="hero image" width="821" height="380" className=""/>
        //         {/* Timer only shows in 'game' layout, with animation */}
        //         <AnimatePresence mode="wait">
        //             {layoutView === "game" && (
        //                 <motion.div
        //                     key="timer"
        //                     initial={{ opacity: 0, y: -40 }}
        //                     animate={{ opacity: 1, y: 0 }}
        //                     exit={{ opacity: 0, y: 40 }}
        //                     transition={{ duration: 0.4 }}
        //                     className="flex flex-col justify-center items-center flex-20/100 h-[100%]"
        //                 >
        //                     <Timer socket={socket} classes="flex flex-col justify-center items-center h-full border-2xl border-border text-accent-foreground dark gap-3" />
        //                 </motion.div>
        //             )}
        //         </AnimatePresence>
        //         {/* Menu panel animates between states */}
        //         <AnimatePresence mode="wait">
        //             <motion.div
        //                 key={layoutView}
        //                 initial={menuVariants.initial}
        //                 animate={menuVariants.animate}
        //                 exit={menuVariants.exit}
        //                 transition={menuVariants.transition}
        //                 id="menu-panel"
        //                 className="w-full h-[40rem] md:flex-1/2 lg:h-full"
        //             >
        //                 <Menu
        //                     socket={socket}
        //                     classes="flex justify-center items-center w-full h-full box-border p-10"
        //                     menuView={menuView}
        //                     setMenuView={setMenuView}
        //                     layoutView={layoutView}
        //                     setLayoutView={setLayoutView}
        //                 />
        //             </motion.div>
        //         </AnimatePresence>
        //     </div>
        //     {/* <AnimatePresence>
        //         {layoutView === "landing" && (
        //             <motion.div
        //                 key="footer"
        //                 initial={{ opacity: 0, y: 24 }}
        //                 animate={{ opacity: 1, y: 0 }}
        //                 exit={{ opacity: 0, y: 24 }}
        //                 transition={{ duration: 0.4 }}
        //                 className="absolute bottom-0 w-full h-1/10"
        //             >
        //                 <Footer />
        //             </motion.div>
        //         )}
        //     </AnimatePresence> */}
        // </div>
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
                    <InGameOptions socket={socket} setMenuView={setMenuView} />
                </div>
            )}
        </div>
    );
}

export default App;