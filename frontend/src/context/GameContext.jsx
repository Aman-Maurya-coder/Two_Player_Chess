import { createContext, useContext, useState } from "react";

export const GameContext = createContext();

export function GameProvider({ children}){
    const [gameState, setGameState] = useState({
        gameId: null,
        gameStatus: "not started", // "not started", "playing", "game over"
        moveNumber: 0, // Current move number
        playerColor: "white", // "white" or "black"
        winner: null, // Player who won the game, null if no winner yet
        reason: null // Reason for game end, e.g., "checkmate", "stalemate", "resignation", "draw"
    });

    const updateGameState = (newState) => {
        // console.log("Updating game state:", newState);
        setGameState((prevState) => ({
            ...prevState,
            ...newState
        }))
    }

    const resetGameState = () => {
        setGameState({
            gameId: null,
            gameStatus: "not started",
            moveNumber: 1,
            playerColor: "white"
        });
    }

    return (
        <GameContext.Provider value={{ gameState, updateGameState, resetGameState }}>
            {children}
        </GameContext.Provider>
    );
}