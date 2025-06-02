import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
// export { moveNumber, playerColor } from "./Chessboard";

export function Board( {gameStatus, onEnd,moveNumber, setMoveNumber, PlayerColor} ) {
    const [game, setGame] = useState(new Chess());
    function makeAMove(movee) {
        try {
            const gameCopy = new Chess(game.fen());
            const result = gameCopy.move(movee);
            if (result) {
                setMoveNumber((moveNumber) => moveNumber + 1); // Increment move number
                console.log("Move number from Chessboard.jsx:", moveNumber);
                setGame(gameCopy);
            }
            return result; // null if the move was illegal, the move object if the move was legal
        } catch (error) {
            // console.error("Error making move:", error);
            return null;
        }
    }
    function onGameEnd() {
        onEnd();
        // Handle game over logic here (e.g., show a message, reset the game, etc.)
        // Add a common state in parent component to handle game over.
        console.log("Game Over from Chessboard.jsx");
    }
    function onDrop(sourceSquare, targetSquare) {
        const move = makeAMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // always promote to a queen for example simplicity
        });
        if(game.isGameOver()) onGameEnd();
        if (move === null) return false; // illegal move
        return true; // legal move, return true to indicate the move was successful
    }
    return (
        <div className="board">
            <Chessboard 
                position={game.fen()}
                onPieceDrop={onDrop}
                animationDuration={0} // Disable animation by setting duration to 0
                allowDragOutsideBoard={false} // Disable dragging outside the board
                arePiecesDraggable = {gameStatus === "playing"} // Disable dragging when game is over
            />
        </div>
    )
}

export function getMoveNumber() {
    return moveNumber;
}
export function getPlayerColor() {
    return playerColor;
}

