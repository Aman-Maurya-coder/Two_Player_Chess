import { useState } from "react"
import { getMoveNumber, getPlayerColor } from "./Chessboard";
import "../assets/MenuStyle.css"

export function Menu({gameStatus, onStart}) {
    let [firstMove, setfirstMove] = useState(1);
    function handleNewGame() {
        // setGameStatus("playing");
        onStart();
        console.log("set game status to playing from Menu.jsx");
    }
    return (
        <div className="menu">
            <button className="newGame" onClick={handleNewGame}>
                New Game
            </button>
            {gameStatus === "playing" && <p>Your Code:</p>}
            {/* <p>Your Code:</p> */}
            <button onClick={() => console.log(getMoveNumber() === 1 && getPlayerColor() === "white" ? "Abort":"Resign")}>{firstMove ? "Abort":"Resign"}</button>
            <button onClick={() => console.log("Draw")}>Offer Draw</button>
        </div>
    )
}