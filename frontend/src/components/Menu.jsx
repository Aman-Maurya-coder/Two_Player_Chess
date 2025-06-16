import { useState } from "react";
import "../assets/MenuStyle.css";
import { useSocketEmit } from "../hooks/useSocketEmit";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { NewGameOptions } from "./gameOptions/NewGameOptions";
import { InGameOptions } from "./gameOptions/InGameOptions";
import { useGameContext, useGameOptionsContext, usePlayerContext, useSocketContext } from "../context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Menu({socket, classes}) {
    // console.log(socket);
    // const socket = useSocketContext();
    const [view, setView] = useState("default"); // Tracks the current view: "default", "newGameOptions", or "joinGameOptions"
    const [gameCode, setGameCode] = useState(""); // Stores the game code entered by the user
    const {playerId} = usePlayerContext();
    const {updateGameOptions} = useGameOptionsContext();
    const {updateGameState} = useGameContext();
    const emitEvent = useSocketEmit(socket);

    useSocketEvent(socket, "playerJoinedRoom", (gameId) => {
        console.log("Player joined room:", gameId);
        updateGameState({
            "gameId": gameId
        })
        emitEvent("roomData", {
            "gameId": gameId
        })
    })

    useSocketEvent(socket, "roomJoiningFailed", ()=>{
        console.error("Failed to join room. Please try again.");
        alert("Failed to join room. Please check the game code and try again.");
        setView("default"); // Reset to default view if joining fails
    })

    useSocketEvent(socket, "roomDataResponse", (gameData) => {
        const playerSide = gameData["roomPlayers"]["white"] === playerId ? "white" : "black";
        updateGameState({
            "gameStatus": gameData["gameStatus"],
            "moveNumber": gameData["moveNumber"],
            "playerColor": playerSide
        })
        updateGameOptions({
            "time": gameData["gameTimer"][playerSide],
            "increment": gameData["gameTimer"]["increment"],
            "playerSide": playerSide
        })
        setView("inGameOptions");
    })
    
    useSocketEvent(socket, "gameNotFound", (message) => {
        console.error("Game not found:", message);
        alert("Game not found. Please check the game code and try again.");
        setView("default"); // Reset to default view if game is not found
    })

    useSocketEvent(socket, "gameFull", (message) => {
        console.error("Game is full:", message);
        alert("Game is full. Please try joining another game.");
        setView("default"); // Reset to default view if game is full
    })

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
            "roomId": gameCode, "playerId": playerId 
        });
        console.log("requested to join the room", gameCode);
        // setView("inGameOptions"); // Switch to the InGameOptions view
    };

    return (
        <div className={classes+" p-10 items-center box-border"}>
            {view === "default" && (
                <div className="flex flex-col justify-center items-center gap-7 w-[80vh] h-[60vh] border-2 border-border p-5">
                    {/* <button className="" onClick={handleNewGame}>
                        New Game
                    </button>
                    <button className="" onClick={handleJoinGame}>
                        Join Game
                    </button> */}
                    <Button className="bg-primary text-4xl font-mono p-4 py-8 w-sm " onClick={handleNewGame}>New Game</Button>
                    <Button className="bg-primary text-4xl font-mono p-4 py-8 w-sm " onClick={handleJoinGame}>Join Game</Button>
                </div>
            )}

            {view === "newGameOptions" && (
                <NewGameOptions
                    socket={socket}
                    setView={setView}
                />
            )}

            {view === "joinGameOptions" && (
                <div className="flex flex-col justify-center items-center gap-9 w-[80vh] h-[60vh] border-2 border-border p-5">
                    {/* <input
                        type="text"
                        placeholder="Enter Game Code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                    /> */}
                    <Input
                        type={"text"}
                        placeholder="Enter Game Code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                        className={"dark:text-3xl dark:h-14 w-sm dark"}
                    ></Input>
                    {/* <button onClick={handleGameCodeSubmit}>Submit</button> */}
                    <div className="flex flex-row-reverse justify-between w-sm">
                    <Button size={"md"} onClick={handleGameCodeSubmit}>Submit</Button>
                    <Button size={"md"} onClick={() => setView("default")}>Back</Button>
                    </div>
                    {/* className="bg-primary text-3xl font-mono p-4 py-8 w-sm dark" */}
                </div>
            )}

            {view === "inGameOptions" && (
                <InGameOptions
                    socket={socket}
                    setMenuView={(view) => setView(view)}
                />
            )}
        </div>
    );
}