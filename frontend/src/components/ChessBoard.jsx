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
        if(gameCopy.moveNumber() > 0){
            updateGameState({
                gameStatus: "playing",
            })
        }
        if (gameCopy.turn() === "w") {
            updateGameState({
                moveNumber: gameState["moveNumber"] + 1,
            });
        }
    });

    useSocketEvent(socket, "gameOver", ({ winner, reason }) => {
        // Handle game over logic here (e.g., show a message, reset the game, etc.)
        updateGameState({
            
        })
        console.log(`Game Over: ${winner} wins! Reason: ${reason}`);
    });

    useSocketEvent(socket, "gameAborted", ({ message, gameStatus }) => {
        // Handle game abort logic here (e.g., show a message, reset the game, etc.)
        console.log(`${message}: Game Status - ${gameStatus}`);
    });

    useSocketEvent(socket, "gameResigned", ({ message, gameStatus }) => {
        console.log(`Game Status - ${gameStatus}`);
    });

    useSocketEvent(socket, "gameResetSuccessful", ({ fen }) => {
        console.log("Game reset successful");
        setGame(new Chess(fen)); // Reset the game state with the provided FEN
        updateGameState({
            "gameStatus": "room full"
        })
    })

    useSocketEvent(socket, "roomClosed", (_) => {
        console.log("Game room closed");
        setGame(new Chess()); // Reset the game state
    })

    function makeAMove(sourceSquare, targetSquare) {
        try {
            const movee = {
                from: sourceSquare,
                to: targetSquare,
                promotion: "q", // always promote to a queen for example simplicity
            };
            console.log(movee);
            const gameCopy = new Chess(game.fen());
            // let result;
            try {
                const result = gameCopy.move(movee);
                console.log(result);
                console.log(gameState["playerColor"]);
                const playerColor = gameState["playerColor"] === "white" ? "w" : "b";
                if (result && result.color === playerColor) {
                    emitEvent("move", {
                        move: movee,
                        gameId: gameState["gameId"], // Assuming gameId is available in the scope
                    });
                    return result; // null if the move was illegal, the move object if the move was legal
                } else {
                    console.error("Illegal move attempted:", movee);
                    return false;
                }
            } catch (error) {
                console.error("Illegal move attempted:", error);
                return false; // Return false if the move is illegal
                
            }
        } catch (error) {
            console.error("Error making move:", error);
            return false;
        }
    }
    return (
        <div id="chessboard" className={classes +""}>
            <div id="board-container" className="flex justify-center items-center w-[50vw] lg:w-[50vh] xl:w-[60vh] 2xl:w-[65vh] shadow-2xl/90 shadow-accent">
                <Chessboard
                    // boardWidth={100}
                    customBoardStyle={{  }} // Set the board size to 50vh
                    customDarkSquareStyle={{ backgroundColor: "#769656" }} // Dark square color
                    customLightSquareStyle={{ backgroundColor: "#EEEED2" }} // Light square color
                    customSquareStyles={{ border: "1px solid #000" }} // Square border style
                    position={game.fen()}
                    snapToCursor={true} // Enable snapping to cursor
                    showBoardNotation={true} // Show board notation
                    showPromotionDialog={true} // Show promotion dialog when a pawn is promoted
                    promotionDialogVariant="modal" // Use modal for promotion dialog
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
