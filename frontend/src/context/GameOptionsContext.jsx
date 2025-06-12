import { createContext, useContext, useState } from "react";

const GameOptionsContext = createContext();

export function useGameOptionsContext() {
    return useContext(GameOptionsContext);
}

export function GameOptionsProvider({ children }) {
    const [gameOptions, setGameOptions] = useState({
        time: 600000,
        increment: 0,
        playerSide: "white", // "white" or "black"
    })

    const updateGameOptions = (newOptions) => {
        setGameOptions((prevOptions) => ({
            ...prevOptions,
            ...newOptions
        }));
    }

    return (
        <GameOptionsContext.Provider value={{ gameOptions, updateGameOptions }}>
            {children}
        </GameOptionsContext.Provider>
    );
}