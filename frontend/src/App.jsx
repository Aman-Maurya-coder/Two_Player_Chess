// NOTE: Have to add resizablePanel between board and menu

import { io } from "socket.io-client";
import { Board } from "./components/ChessBoard";
import { Navbar } from "./components/Navbar";
import { Menu } from "./components/Menu";
import { Footer } from "./components/Footer";
import { GameOverPopup } from "./components/GameOverPopup";
import {
    usePlayerContext,
    useGameContext,
    useTimerContext,
} from "./context/index.jsx";
import { useState, useEffect } from "react";
import { useSocketEmit } from "./hooks/useSocketEmit";
import { useSocketEvent } from "./hooks/useSocketEvent";
import { Timer } from "./components/Timer";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const url = "localhost:3000";

function App() {
    const [socket, setSocket] = useState(null);
    // console.log(socket);
    const { playerId, setPlayerId, playerData, setPlayerData } =
        usePlayerContext();
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
    if (playerId) {
        emitEvent("playerReconnected", { playerId });
    }

    useSocketEvent(socket, "connect", () => {
        console.log("Socket connected:", socket);
        // setSocket(socketInstance);
        // Emit an event to notify the server that a new client has connected
        emitEvent("onPlayerJoin", {
            playerId: "",
        });
    });

    useSocketEvent(socket, "playerId", (newPlayerId) => {
        setPlayerId(newPlayerId);
        localStorage.setItem("playerId", JSON.stringify(newPlayerId));
        console.log("Player ID set:", newPlayerId);
        emitEvent("playerData", { playerId: newPlayerId });
    });
    useSocketEvent(socket, "playerDataResponse", (data) => {
        setPlayerData(data);
        console.log("Player data received:", data);
    });
    useSocketEvent(socket, "playerNotFound", () => {
        console.error("Player not found");
        localStorage.removeItem("playerId");
        setPlayerId(null);
        setPlayerData({});
    });

    useSocketEvent(socket, "playerDisconnected", ({ gameData }) => {
        console.log("Other player left the game");
        updateGameState({
            gameStatus: gameData["gameStatus"],
        });
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
        const handleBeforeUnload = (event) => {
            emitEvent("Disconnect", { playerId });
            if (playerData["gameId"] === null) {
                localStorage.removeItem("playerId");
                console.log("Player ID cleared from localStorage");
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [playerId, emitEvent]);
    return (
        <div className="flex flex-col" style={{ height: "100%" }}>
            <Navbar></Navbar>
            {/* {gameState.gameStatus !== "not started" || gameState.gameStatus !== "playing" && <GameOverPopup />} */}
            {/* <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline">Show Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog> */}
            <div className="flex flex-row flex-90/100 items-center justify-center overflow-hidden box-border">
                <Board
                    socket={socket}
                    classes="flex justify-center items-center h-[100%] flex-35/100 "
                />
                <Timer 
                    socket={socket} 
                    classes="flex flex-col justify-center items-center flex-20/100 h-[100%] border-2xl border-border text-accent-foreground dark gap-3"
                />
                <Menu
                    socket={socket}
                    classes="flex flex-45/100 flex-col justify-center items-center h-[100%]"
                />
            </div>
            <Footer></Footer>
        </div>
    );
}

export default App;
