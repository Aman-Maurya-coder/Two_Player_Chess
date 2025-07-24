import { useCallback, useState, useEffect } from "react";
import { useTimer } from "../hooks/useTimer";
import { useGameContext } from "../context";
import { Label } from "@/components/ui/label";
import { cn } from  "@/lib/utils";

export function Timer({socket, side}){
    const  { whiteTime, blackTime, currentTurn } = useTimer(socket);
    const { gameState } = useGameContext();
    const [activeTimer, setActiveTimer] = useState([false, false]); // [upperTimer, lowerTimer]

    useEffect(() => {
        // console.log(gameState["gameStatus"])
        if (gameState["gameStatus"] === "playing") {
            const isWhiteTurn = currentTurn === "w";
            const isPlayerWhite = gameState["playerColor"] === "white"; 
            setActiveTimer((isWhiteTurn && isPlayerWhite) ? [false, true] : [true, false]);
        } else {
            setActiveTimer([false, false]); // Deactivate both timers if not in playing state
        }
    }, [gameState["gameStatus"], currentTurn]);
    console.log(activeTimer);
    const formatTime = useCallback((timeInMs) => {
        const totalSeconds = Math.max(0, Math.floor(timeInMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },[]);
    
    const timerColor = (turn, side) => {
        console.log(turn, side);
        if ((turn === "w" && side === "white") || (turn === "b" && side === "black") ) {
            return true;
        }
    }

    return (
        <div className="w-[28%] h-[8%] text-center">  
            <p className={cn("px-2 bg-timer-disabled text-timer-disabled-text rounded-[5px] w-full h-full text-lg font-semibold tracking-wide",timerColor(currentTurn, side) && "bg-secondary-foreground text-black")}>{formatTime(side === "white" ? whiteTime : blackTime)}</p>
        </div>
    );
}
{/* <Label className={cn("dark text-muted py-3 px-7 rounded-md bg-muted-foreground text-4xl",activeTimer[0] ? "bg-primary text-primary-foreground/70" : "")}>{gameState["playerColor"] === "white"?formatTime(blackTime): formatTime(whiteTime)}</Label> */}
{/* <Label className={cn("dark text-muted py-3 px-7 rounded-md bg-muted-foreground text-4xl",activeTimer[1] ? "bg-primary text-primary-foreground/70" : "")}>{gameState["playerColor"] === "white"?formatTime(whiteTime): formatTime(blackTime)}</Label> */}