import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Timer } from "./Timer";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { useSocketEmit } from "../hooks/useSocketEmit";
import { useSocketContext } from "../context";
// export { moveNumber, playerColor } from "./Chessboard";

export function Board( {socket, gameStatus, onGameStatusChange ,moveNumber, setMoveNumber, PlayerColor} ) {
    // const {socket} = useSocketContext();
    const [game, setGame] = useState(new Chess());
    const emitEvent = useSocketEmit(socket);

    useSocketEvent(socket, "moveMade", ({fen, currentTurn}) => {
        // setGame(new Chess(fen));
        const gameCopy = new Chess(fen);
        if( game.fen() === gameCopy.fen() ) return; 
        else setGame(gameCopy); // Update the game state only if the FEN has changed
        // setCurrentTurn(currentTurn);
        // console.log("Move made:", move);
        // console.log("Game FEN:", fen);
    })

    useSocketEvent(socket, "gameOver", ({ winner, reason }) => {
        onGameStatusChange(reason);
        // Handle game over logic here (e.g., show a message, reset the game, etc.)
        console.log(`Game Over: ${winner} wins! Reason: ${reason}`);
    })

    useSocketEvent(socket, "gameAbort", ({ message, gameStatus }) => {
        onGameStatusChange(gameStatus)
        // Handle game abort logic here (e.g., show a message, reset the game, etc.)
        console.log(`${message}: Game Status - ${gameStatus}`);
    })

    useSocketEvent(socket, "gameResign", ({ message, gameStatus }) => {
        onGameStatusChange(gameStatus)
        console.log(`${message}: Game Status - ${gameStatus}`);
    })

    function makeAMove(sourceSquare, targetSquare) {
        try {
            movee = {
                from: sourceSquare,
                to: targetSquare,
                promotion: "q", // always promote to a queen for example simplicity
            }
            const gameCopy = new Chess(game.fen());
            const result = gameCopy.move(movee);
            if (result) {
                setMoveNumber((moveNumber) => moveNumber + 1); // Increment move number
                setGame(gameCopy);
                // console.log("Move number from Chessboard.jsx:", moveNumber);
                // socket.emit("move",{
                //     move: movee,
                //     gameId: gameId, // Assuming gameId is available in the scope
                // })
                emitEvent("move", {
                    move: movee,
                    gameId: gameId, // Assuming gameId is available in the scope
                })
                return result; // null if the move was illegal, the move object if the move was legal
            }
            else return false;
        } catch (error) {
            console.error("Error making move:", error);
            return false;
        }
    }


    // function onGameEnd() {
    //     onGameStatusChange();
    //     // Handle game over logic here (e.g., show a message, reset the game, etc.)
    //     // Add a common state in parent component to handle game over.
    //     console.log("Game Over from Chessboard.jsx");
    // }
    return (
        <div className="board">
            <Chessboard 
                position={game.fen()}
                onPieceDrop={makeAMove} // Use the makeAMove function to handle piece drops
                animationDuration={0} // Disable animation by setting duration to 0
                allowDragOutsideBoard={false} // Disable dragging outside the board
                arePiecesDraggable = {gameStatus === "playing"} // Disable dragging when game is over
            />
            <Timer/>
        </div>
    )
}


