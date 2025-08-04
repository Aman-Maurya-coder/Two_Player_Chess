import {
    useTimerContext
} from "../context/index.jsx";

export function useTimer() {
    const { whiteTime, blackTime, currentTurn } = useTimerContext();
    // console.log("using timer", whiteTime);


    return { whiteTime, blackTime, currentTurn };
}