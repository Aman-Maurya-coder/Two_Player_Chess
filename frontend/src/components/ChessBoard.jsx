import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Timer } from "./Timer";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { useSocketEmit } from "../hooks/useSocketEmit";
import {
    useGameContext,
    useGameOptionsContext,
    useTimerContext,
} from "../context";
// export { moveNumber, playerColor } from "./Chessboard";

export function Board({ socket, classes }) {
    // const {socket} = useSocketContext();
    const [game, setGame] = useState(new Chess());
    const { gameState, updateGameState } = useGameContext();
    const { setCurrentTurn } = useTimerContext();
    const emitEvent = useSocketEmit(socket);

    useSocketEvent(socket, "moveMade", ({ fen, currentTurn }) => {
        const gameCopy = new Chess(fen);
        setGame(gameCopy);
        setCurrentTurn(currentTurn);
    });

    useSocketEvent(socket, "gameOver", ({ winner, reason }) => {
        updateGameState({
            gameStatus: reason,
        });
        // Handle game over logic here (e.g., show a message, reset the game, etc.)
        console.log(`Game Over: ${winner} wins! Reason: ${reason}`);
    });

    useSocketEvent(socket, "gameAbort", ({ message, gameStatus }) => {
        updateGameState({
            gameStatus: reason,
        });
        // Handle game abort logic here (e.g., show a message, reset the game, etc.)
        console.log(`${message}: Game Status - ${gameStatus}`);
    });

    useSocketEvent(socket, "gameResign", ({ message, gameStatus }) => {
        updateGameState({
            gameStatus: reason,
        });
        console.log(`${message}: Game Status - ${gameStatus}`);
    });

    function makeAMove(sourceSquare, targetSquare) {
        try {
            const movee = {
                from: sourceSquare,
                to: targetSquare,
                promotion: "q", // always promote to a queen for example simplicity
            };
            const gameCopy = new Chess(game.fen());
            const result = gameCopy.move(movee);
            if (result) {
                updateGameState({
                    moveNumber: gameState["moveNumber"] + 1,
                });
                console.log(
                    "making the move,",
                    movee,
                    "in room :",
                    gameState["gameId"]
                );
                emitEvent("move", {
                    move: movee,
                    gameId: gameState["gameId"], // Assuming gameId is available in the scope
                });
                return result; // null if the move was illegal, the move object if the move was legal
            } else return false;
        } catch (error) {
            console.error("Error making move:", error);
            return false;
        }
    }
    return (
        <div className={classes}>
            <div style={{ width: "60vh"}}>
                <Chessboard
                    // boardWidth={100}
                    customBoardStyle={{ }} // Set the board size to 50vh
                    customDarkSquareStyle={{ backgroundColor: "#17ad56" }} // Dark square color
                    customLightSquareStyle={{ backgroundColor: "#acb2c0" }} // Light square color
                    customSquareStyles={{ border: "1px solid #000" }} // Square border style
                    position={game.fen()}
                    snapToCursor={true} // Enable snapping to cursor
                    showBoardNotation={true} // Show board notation
                    // showPromotionDialog={true} // Show promotion dialog when a pawn is promoted
                    // promotionDialogVariant="modal" // Use modal for promotion dialog
                    boardOrientation={gameState["playerColor"]}
                    onPieceDrop={makeAMove} // Use the makeAMove function to handle piece drops
                    animationDuration={0} // Disable animation by setting duration to 0
                    allowDragOutsideBoard={false} // Disable dragging outside the board
                    arePiecesDraggable={
                        gameState["gameStatus"] === "room full" ||
                        gameState["gameStatus"] === "playing"
                    } // Disable dragging when game is over
                />
            </div>
            {/* <Timer socket={socket} /> */}
        </div>
    );
}
