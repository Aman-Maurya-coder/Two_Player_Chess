import { useState, useEffect } from "react";
import { useSocketEvent } from "./useSocketEvent";
import { useTimerContext } from "../context/TimerContext";
import { useGameContext } from "../context/GameContext";

export function useTimer(socket) {
    const { whiteTime, blackTime, currentTurn, setWhiteTime, setBlackTime, setCurrentTurn } = useTimerContext();
    const { updateGameState } = useGameContext();

    useSocketEvent(socket, "timeUpdate", ({whiteTime, blackTime, currentTurn}) => {
        // Update the timer state with the new times
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
        updateGameState({ status: reason });
    })

    return { whiteTime, blackTime, currentTurn };
}