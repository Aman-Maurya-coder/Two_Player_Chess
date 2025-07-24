import { useState, useEffect } from "react";
import { useSocketEvent } from "./useSocketEvent";
import {
    useTimerContext,
    useGameContext
} from "../context/index.jsx";

export function useTimer(socket) {
    const { whiteTime, blackTime, currentTurn, setWhiteTime, setBlackTime, setCurrentTurn } = useTimerContext();
    console.log("using timer", whiteTime);
    const { updateGameState } = useGameContext();

    useSocketEvent(socket, "timeUpdate", ({whiteTime, blackTime, currentTurn}) => {
        // Update the timer state with the new time
        // console.log("updated time:",whiteTime, blackTime);
        setWhiteTime(whiteTime);
        setBlackTime(blackTime);
        setCurrentTurn(currentTurn);
    })

    useSocketEvent(socket, "incrementedTime", ({whiteTime, blackTime, currentTurn}) => {
        // Update the timer state with the new times
        setWhiteTime(whiteTime);
        setBlackTime(blackTime);
        setCurrentTurn(currentTurn);
    })

    useSocketEvent(socket, "gameTimeout", ({loser, winner, reason}) => {
        alert(`${loser} lost on time! ${winner} wins!`);
        // Optionally, you can handle game status change here if needed
        updateGameState({ 
            status: reason 
        });
    })

    return { whiteTime, blackTime, currentTurn };
}