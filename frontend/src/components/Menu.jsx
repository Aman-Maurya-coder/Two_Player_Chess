import { useState, useRef, useEffect } from "react";
import "../assets/MenuStyle.css";
import { useSocketEmit } from "../hooks/useSocketEmit";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { NewGameOptions } from "./gameOptions/NewGameOptions";
import { InGameOptions } from "./gameOptions/InGameOptions";
import {
    useGameContext,
    useGameOptionsContext,
    usePlayerContext,
    useSocketContext,
} from "../context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



export function Menu({ socket, classes }) {
    // console.log(socket);
    // const socket = useSocketContext();
    const [view, setView] = useState("default"); // Tracks the current view: "default", "newGameOptions", or "joinGameOptions"
    const [gameCode, setGameCode] = useState(""); // Stores the game code entered by the user
    const joinGameRef = useRef(null); // Reference to the join game input field
    const { playerId } = usePlayerContext();
    const { updateGameOptions } = useGameOptionsContext();
    const { updateGameState } = useGameContext();
    const emitEvent = useSocketEmit(socket);

    useEffect(()=>{
        if(view === "joinGameOptions" && joinGameRef.current) {
            // Focus the join game input field when the view changes to "joinGameOptions"
            joinGameRef.current.focus();
        }
    },[view])

    //IMP: have to implement this...
    // const handleViewChange = (newView) => {
    //     setView(newView);
    //     if (newView === "joinGameOptions" && joinGameRef.current) {
    //         joinGameRef.current.focus();
    //     }
    // };

    useSocketEvent(socket, "playerJoinedRoom", (gameId) => {
        console.log("Player joined room:", gameId);
        updateGameState({
            gameId: gameId,
        });
        emitEvent("roomData", {
            gameId: gameId,
        });
    });

    useSocketEvent(socket, "roomJoiningFailed", () => {
        console.error("Failed to join room. Please try again.");
        alert("Failed to join room. Please check the game code and try again.");
        setView("default"); // Reset to default view if joining fails
    });

    useSocketEvent(socket, "roomDataResponse", (gameData) => {
        const playerSide =
            gameData["roomPlayers"]["white"] === playerId ? "white" : "black";
        updateGameState({
            gameStatus: gameData["gameStatus"],
            moveNumber: gameData["moveNumber"],
            playerColor: playerSide,
        });
        updateGameOptions({
            time: gameData["gameTimer"][playerSide],
            increment: gameData["gameTimer"]["increment"],
            playerSide: playerSide,
        });
        setView("inGameOptions");
    });

    useSocketEvent(socket, "gameNotFound", (message) => {
        console.error("Game not found:", message);
        alert("Game not found. Please check the game code and try again.");
        setView("default"); // Reset to default view if game is not found
    });

    useSocketEvent(socket, "gameFull", (message) => {
        console.error("Game is full:", message);
        alert("Game is full. Please try joining another game.");
        setView("default"); // Reset to default view if game is full
    });

    const handleNewGame = () => {
        setView("newGameOptions"); // Switch to the NewGameOptions view
    };

    const handleJoinGame = () => {
        setView("joinGameOptions"); // Switch to the Join Game input field view
    };

    const handleGameCodeSubmit = () => {
        // Emit the join game event with the entered game code
        const playerId = JSON.parse(localStorage.getItem("playerId"));
        if (playerId === null) {
            console.error("Player ID is null. Cannot join game.");
            setView("default"); // Reset to default view if player ID is not set
            return;
        }
        emitEvent("joinGame", {
            roomId: gameCode,
            playerId: playerId,
        });
        console.log("requested to join the room", gameCode);
        // setView("inGameOptions"); // Switch to the InGameOptions view
    };

    return (
        <div className={classes + " items-center box-border"}>
            <div className="w-[80vh] h-[60vh] border-2 border-border overflow-hidden p-5 rounded-lg bg-card">
                {view === "default" && (
                    <div className="flex flex-col justify-center items-center gap-7 w-full h-full">
                        <Button
                            size="mine"
                            variant="default"
                            onClick={handleNewGame}
                        >
                            New Game
                        </Button>
                        <Button
                            size="mine"
                            variant="outline"
                            onClick={handleJoinGame}
                        >
                            Join Game
                        </Button>
                    </div>
                )}

                {view === "newGameOptions" && (
                    <NewGameOptions socket={socket} setView={setView} />
                )}

                {view === "joinGameOptions" && (
                    <div className="flex flex-col justify-center items-center gap-9 h-full w-full">
                        <Input
                            type={"text"}
                            placeholder="Enter Game Code"
                            value={gameCode}
                            onChange={(e) => setGameCode(e.target.value)}
                            className={"dark:text-3xl dark:h-14 w-sm dark"}
                            ref={joinGameRef}
                        ></Input>
                        <div className="flex flex-row-reverse justify-between w-sm">
                            <Button size={"md"} onClick={handleGameCodeSubmit}>
                                Submit
                            </Button>
                            <Button
                                size={"md"}
                                onClick={() => setView("default")}
                                variant={"outline"}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                )}

                {view === "inGameOptions" && (
                    <InGameOptions
                        socket={socket}
                        setMenuView={(view) => setView(view)}
                    />
                )}
            </div>
        </div>
    );
}
