import { useCallback, useState } from "react"
// import { getMoveNumber, getPlayerColor } from "./ChessBoard";
import "../assets/MenuStyle.css"
import { useSocketEmit } from "../hooks/useSocketEmit";

export function Menu({gameStatus, onStart}) {
    let [firstMove, setfirstMove] = useState(1);
    const [newGame, setNewGame] = useState(false);
    const emitEvent = useSocketEmit();
    const handleNewGame = useCallback(() => {
        // setGameStatus("playing");
        onStart();
        emitEvent("newGame", {playerId: playerId, playerSide: playerSide, time: time})
        console.log("set game status to playing from Menu.jsx");
    },[onStart, emitEvent]);
    return (
        <div className="menu">
            <button className="newGame" onClick={() => setNewGame(true)}>
                New Game
            </button>
            {gameStatus === "playing" && <p>Your Code:</p>}
            {/* <p>Your Code:</p> */}
            <button onClick={() => console.log(getMoveNumber() === 1 && getPlayerColor() === "white" ? "Abort":"Resign")}>{firstMove ? "Abort":"Resign"}</button>
            <button onClick={() => console.log("Draw")}>Offer Draw</button>
        </div>
    )
}