import { useState, useEffect } from "react";
import { timerManager } from "../components/utils/timerManager";

export function useTimer() {
    const [timerState, setTimerState] = useState({
        whiteTime: timerManager.whiteTime,
        blackTime: timerManager.blackTime,
        currentTurn: timerManager.currentTurn
    });

    useEffect(() => {
        // Subscribe directly to timerManager
        const unsubscribe = timerManager.subscribe((newState) => {
            setTimerState(newState);
        });

        // Get current state immediately
        setTimerState({
            whiteTime: timerManager.whiteTime,
            blackTime: timerManager.blackTime,
            currentTurn: timerManager.currentTurn
        });

        return unsubscribe;
    }, []);

    return timerState;
}