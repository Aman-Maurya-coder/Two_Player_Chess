import { createContext, useContext, useState, useEffect } from "react";
import { useGameOptionsContext } from "./index.jsx";

export const TimerContext = createContext();


export function TimerProvider({ children }){
    const { gameOptions } = useGameOptionsContext();
    const [whiteTime, setWhiteTime] = useState(gameOptions["time"] || 30000); // 5 minutes in ms
    const [blackTime, setBlackTime] = useState(gameOptions["time"] || 30000); // 5 minutes in ms
    const [currentTurn, setCurrentTurn] = useState('white');

    return (
        <TimerContext.Provider value={{ whiteTime, blackTime, currentTurn, setWhiteTime, setBlackTime, setCurrentTurn }}>
            {children}
        </TimerContext.Provider>
    );
}