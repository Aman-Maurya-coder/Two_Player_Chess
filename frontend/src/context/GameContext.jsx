import { Chess } from "chess.js";
import { createContext, useContext, useState, useRef } from "react";

/**
 * Game context for managing chess game state throughout the application
 * Provides game state, chess instance, and state management functions
 */
export const GameContext = createContext();

/**
 * Game context provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function GameProvider({ children}){
    const gameRef = useRef(new Chess());
    const game = gameRef.current;
    const [gameState, setGameState] = useState({
        gameId: null,
        gameStatus: "not started", // "not started", "playing", "game over"
        moveNumber: 0, // Current move number
        playerColor: "white", // "white" or "black"
        winner: null, // Player who won the game, null if no winner yet
        reason: null // Reason for game end, e.g., "checkmate", "stalemate", "resignation", "draw"
    });

    /**
     * Update game state with new properties
     * @param {Object} newState - New state properties to merge
     */
    const updateGameState = (newState) => {
        console.log("Updating game state:", newState);
        setGameState((prevState) => ({
            ...prevState,
            ...newState
        }))
    }

    /**
     * Reset game state to initial values and create new chess instance
     */
    const resetGameState = () => {
        game.reset(); // Reset the chess instance to its initial state
        setGameState({
            gameId: null,
            gameStatus: "not started",
            moveNumber: 1,
            playerColor: "white"
        });
    }

    return (
        <GameContext.Provider value={{ game, gameState, updateGameState, resetGameState }}>
            {children}
        </GameContext.Provider>
    );
}