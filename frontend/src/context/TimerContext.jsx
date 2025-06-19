import { createContext, useState, useEffect } from "react";
import { useGameOptionsContext } from "./index.jsx";

export const TimerContext = createContext();


export function TimerProvider({ children }){
    const { gameOptions } = useGameOptionsContext();
    const [whiteTime, setWhiteTime] = useState(gameOptions["time"] || 300000); // 5 minutes in ms
    const [blackTime, setBlackTime] = useState(gameOptions["time"] || 300000); // 5 minutes in ms
    const [currentTurn, setCurrentTurn] = useState('white');

    const resetTimer = () => {
        setWhiteTime(300000);
        setBlackTime(300000);
        setCurrentTurn('white');
    };

    return (
        <TimerContext.Provider value={{ whiteTime, blackTime, currentTurn, setWhiteTime, setBlackTime, setCurrentTurn, resetTimer }}>
            {children}
        </TimerContext.Provider>
    );
}