import { createContext, useState, useEffect, useContext } from "react";
import { timerManager } from "@/components/utils/timerManager";

export const TimerContext = createContext();

export function TimerProvider({ children }) {
    const [timerState, setTimerState] = useState({
        whiteTime: 300000,
        blackTime: 300000,
        currentTurn: 'white'
    });

    useEffect(() => {
        // Subscribe to timer manager updates
        const unsubscribe = timerManager.subscribe((newState) => {
            setTimerState(newState);
        });

        return unsubscribe;
    }, []);

    const resetTimer = () => {
        timerManager.reset();
    };

    const setWhiteTime = (time) => {
        timerManager.updateTime(time, timerState.blackTime, timerState.currentTurn);
    };

    const setBlackTime = (time) => {
        timerManager.updateTime(timerState.whiteTime, time, timerState.currentTurn);
    };

    const setCurrentTurn = (turn) => {
        timerManager.updateTime(timerState.whiteTime, timerState.blackTime, turn);
    };

    return (
        <TimerContext.Provider value={{ 
            whiteTime: timerState.whiteTime,
            blackTime: timerState.blackTime,
            currentTurn: timerState.currentTurn,
            setWhiteTime,
            setBlackTime,
            setCurrentTurn,
            resetTimer 
        }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimerContext() {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimerContext must be used within a TimerProvider');
    }
    return context;
}