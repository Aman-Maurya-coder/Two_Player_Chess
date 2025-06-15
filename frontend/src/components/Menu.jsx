import { useState } from "react";
import "../assets/MenuStyle.css";
import { useSocketEmit } from "../hooks/useSocketEmit";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { NewGameOptions } from "./gameOptions/NewGameOptions";
import { InGameOptions } from "./gameOptions/InGameOptions";
import { useGameContext, useGameOptionsContext, usePlayerContext, useSocketContext } from "../context";

export function Menu({socket}) {
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
        <div className="menu">
            {view === "default" && (
                <>
                    <button className="newGame" onClick={handleNewGame}>
                        New Game
                    </button>
                    <button className="joinGame" onClick={handleJoinGame}>
                        Join Game
                    </button>
                </>
            )}

            {view === "newGameOptions" && (
                <NewGameOptions
                    socket={socket}
                    setView={setView}
                />
            )}

            {view === "joinGameOptions" && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter Game Code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                    />
                    <button onClick={handleGameCodeSubmit}>Submit</button>
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