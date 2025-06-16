import { useCallback } from "react";
import { useTimer } from "../hooks/useTimer";
import { useGameContext } from "../context";
import { Label } from "@/components/ui/label";

export function Timer({socket, classes}){
    const  { whiteTime, blackTime, currentTurn } = useTimer(socket);
    const { gameState } = useGameContext();

    const formatTime = useCallback((timeInMs) => {
        const totalSeconds = Math.max(0, Math.floor(timeInMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },[]);
                // bg-(--activeTimer-background) can be used to set background with a custom css variable.
    return (
        <div className={classes}>       
            <Label className="dark text-muted-foreground bg-sidebar-accent-foreground text-4xl py-3 px-7 rounded-md hover:bg-primary hover:text-primary-foreground/70">{gameState["playerColor"] === "white"?formatTime(blackTime): formatTime(whiteTime)}</Label>
            <Label className="dark text-muted-foreground py-3 px-7 rounded-md bg-sidebar-accent-foreground text-4xl">{gameState["playerColor"] === "white"?formatTime(whiteTime): formatTime(blackTime)}</Label>
        </div>
    );
}