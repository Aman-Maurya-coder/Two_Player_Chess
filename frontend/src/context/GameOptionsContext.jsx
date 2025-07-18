import { createContext, useContext, useState } from "react";

export const GameOptionsContext = createContext();


export function GameOptionsProvider({ children }) {
    const [gameOptions, setGameOptions] = useState({
        time: null,
        increment: 0,
        playerSide: "white", // "white" or "black"
    })

    const updateGameOptions = (newOptions) => {
        console.log("updating game options", newOptions);
        setGameOptions((prevOptions) => ({
            ...prevOptions,
            ...newOptions
        }));
    }

    const resetGameOptions = () => {
        setGameOptions({
            time: null,
            increment: 0,
            playerSide: "white", // Reset to default values
        });
    }

    return (
        <GameOptionsContext.Provider value={{ gameOptions, updateGameOptions, resetGameOptions }}>
            {children}
        </GameOptionsContext.Provider>
    );
}