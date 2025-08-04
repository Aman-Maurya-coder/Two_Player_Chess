import { createContext, useState, useEffect } from "react";
import { useGameOptionsContext } from "./index.jsx";

export const TimerContext = createContext();


export function TimerProvider({ children }){
    const { gameOptions } = useGameOptionsContext();
    // console.log("using timer", gameOptions["time"]);
    const [whiteTime, setWhiteTime] = useState(gameOptions["time"] ?? 300000); 
    const [blackTime, setBlackTime] = useState(gameOptions["time"] ?? 300000);
    const [currentTurn, setCurrentTurn] = useState('white');
    // console.log("using timer", whiteTime, gameOptions["time"]);

    useEffect(() => {
        setWhiteTime(gameOptions["time"]);
        setBlackTime(gameOptions["time"]);
    }, [gameOptions["time"]]);

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