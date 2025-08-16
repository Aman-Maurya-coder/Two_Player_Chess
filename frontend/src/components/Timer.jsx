import { useCallback, memo } from "react";
import { useTimer } from "../hooks/useTimer";
import { cn } from "@/lib/utils";

export const Timer = memo(function Timer({ side }) {
    const { whiteTime, blackTime, currentTurn } = useTimer();

    const formatTime = useCallback((timeInMs) => {
        const totalSeconds = Math.max(0, Math.floor(timeInMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }, []);

    const timerColor = useCallback((turn, side) => {
        // console.log(turn, side);
        if (
            (turn === "w" && side === "white") ||
            (turn === "b" && side === "black")
        ) {
            return true;
        }
    }, []);

    return (
        <div className={cn("w-[28%] h-8 flex items-center flex-col justify-center px-2 bg-timer-disabled text-timer-disabled-text rounded-[5px] text-lg font-semibold tracking-wide text-center md:shadow-[0_0_8px_5px_rgba(0,0,0,0.3)] md:h-10 md:text-xl md:tracking-normal lg:h-7 lg:text-base", timerColor(currentTurn, side) && "bg-secondary-foreground text-black")}>
                {formatTime(side === "white" ? whiteTime : blackTime)}
                {/* {console.log(side === "white" ? "whiteTime" : "blackTime")} */}
        </div>
    );
});
