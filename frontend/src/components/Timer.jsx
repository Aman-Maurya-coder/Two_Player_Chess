import { useCallback } from "react";
import { useTimer } from "../hooks/useTimer";
import { useGameContext } from "../context";

export function Timer({socket}){
    const  { whiteTime, blackTime, currentTurn } = useTimer(socket);
    const { gameState } = useGameContext();

    const formatTime = useCallback((timeInMs) => {
        const totalSeconds = Math.max(0, Math.floor(timeInMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },[]);

    return (
        <div className="timer-container">
            <div className={`timer ${currentTurn === 'white' ? 'active' : ''} `}>       {/* ${playerColor === 'white' ? 'player' : 'opponent'} */}
                <div className="timer-label">{gameState["playerColor"] === "white"? "Black": "White"}</div>
                <div className="timer-display">{gameState["playerColor"] === "white"?formatTime(blackTime): formatTime(whiteTime)}</div>
            </div>
            
            <div className={`timer ${currentTurn === 'black' ? 'active' : ''} `}>       {/* ${playerColor === 'white' ? 'opponent' : 'player'} */}
                <div className="timer-label">{gameState["playerColor"] === "white" ? "White": "Black"}</div>
                <div className="timer-display">{gameState["playerColor"] === "white"?formatTime(whiteTime): formatTime(blackTime)}</div>
            </div>
        </div>
    );
}