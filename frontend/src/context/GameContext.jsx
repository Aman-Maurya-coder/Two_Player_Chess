import { createContext, useContext, useState } from "react";

export const GameContext = createContext();

export function GameProvider({ children}){
    const [gameState, setGameState] = useState({
        gameStatus: "not started", // "not started", "playing", "game over"
        moveNumber: 1, // Current move number
        playerColor: "white" // "white" or "black"
    });

    const updateGameState = (newState) => {
        setGameState((prevState) => ({
            ...prevState,
            ...newState
        }))
    }

    return (
        <GameContext.Provider value={{ gameState, updateGameState }}>
            {children}
        </GameContext.Provider>
    );
}