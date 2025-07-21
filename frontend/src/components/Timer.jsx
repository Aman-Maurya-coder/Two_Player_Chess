import { useCallback, useState, useEffect } from "react";
import { useTimer } from "../hooks/useTimer";
import { useGameContext } from "../context";
import { Label } from "@/components/ui/label";
import { cn } from  "@/lib/utils";

export function Timer({socket, classes, side}){
    const  { whiteTime, blackTime, currentTurn } = useTimer(socket);
    const { gameState } = useGameContext();
    const [activeTimer, setActiveTimer] = useState([false, false]); // [upperTimer, lowerTimer]

    useEffect(() => {
        // console.log(gameState["gameStatus"])
        if(gameState["gameStatus"] === "playing"){
            // Determine which timer to activate based on the current turn and player color
            // console.log("Current Turn:", currentTurn);
            if(gameState["playerColor"] === "white"){
                if(currentTurn === "w"){
                    // console.log("white's turn");
                    setActiveTimer([false, true]); // Activate white timer
                }
                else{
                    // console.log("black's turn");
                    setActiveTimer([true, false]); // Activate black timer
                }
            }
            else{
                if(currentTurn === "w"){
                    // console.log("black's turn");
                    setActiveTimer([true, false]); // Activate black timer
                }
                else{
                    // console.log("white's turn");
                    setActiveTimer([false, true]); // Activate white timer
                }
            }
        }
        else{
            setActiveTimer([false, false]); // Deactivate both timers if not in playing state
        }
    }, [gameState["gameStatus"], currentTurn]);

    const formatTime = useCallback((timeInMs) => {
        const totalSeconds = Math.max(0, Math.floor(timeInMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },[]);
                // bg-(--activeTimer-background) can be used to set background with a custom css variable.
    return (
        <div className={classes}>  
            <Label className={cn("dark text-muted py-3 px-7 rounded-md bg-muted-foreground text-4xl",activeTimer[side === "white" ? 1 : 0] ? "bg-destructive text-background" : "bg-highlight text-secondary-background")}>{formatTime(side === "white" ? whiteTime : blackTime)}</Label>
        </div>
    );
}
{/* <Label className={cn("dark text-muted py-3 px-7 rounded-md bg-muted-foreground text-4xl",activeTimer[0] ? "bg-primary text-primary-foreground/70" : "")}>{gameState["playerColor"] === "white"?formatTime(blackTime): formatTime(whiteTime)}</Label> */}
{/* <Label className={cn("dark text-muted py-3 px-7 rounded-md bg-muted-foreground text-4xl",activeTimer[1] ? "bg-primary text-primary-foreground/70" : "")}>{gameState["playerColor"] === "white"?formatTime(whiteTime): formatTime(blackTime)}</Label> */}