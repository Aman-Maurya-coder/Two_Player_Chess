import { useCallback } from "react";
import { useTimer } from "../hooks/useTimer";

export function Timer({socket}){
    const  { whiteTime, blackTime, currentTurn } = useTimer(socket);

    const formatTime = useCallback((timeInMs) => {
        const totalSeconds = Math.max(0, Math.floor(timeInMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },[]);

    return (
        <div className="timer-container">
            <div className={`timer ${currentTurn === 'white' ? 'active' : ''} `}>       {/* ${playerColor === 'white' ? 'player' : 'opponent'} */}
                <div className="timer-label">White</div>
                <div className="timer-display">{formatTime(blackTime)}</div>
            </div>
            
            <div className={`timer ${currentTurn === 'black' ? 'active' : ''} `}>       {/* ${playerColor === 'white' ? 'opponent' : 'player'} */}
                <div className="timer-label">Black</div>
                <div className="timer-display">{formatTime(whiteTime)}</div>
            </div>
        </div>
    );
}