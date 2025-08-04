import { useState, memo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Timer } from "./Timer";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { useSocketEmit } from "../hooks/useSocketEmit";
import { TimerProvider } from "@/context/TimerContext";
import {
    useGameContext,
    useGameOptionsContext,
    useTimerContext,
} from "../context";
export const Board =  memo( function Board ({ socket }) {
    // ${window.innerHeight > window.innerWidth ? "" : "w-[50vh]"} have to check it for resizing of the board.

    const { game, setGame, gameState, updateGameState } = useGameContext();
    const emitEvent = useSocketEmit(socket);

    useSocketEvent(socket, "moveMade", ({ fen, _ }) => {
        const gameCopy = new Chess(fen);
        setGame(gameCopy);
        if (gameCopy.moveNumber() == 1) {
            updateGameState({
                gameStatus: "playing",
            });
        }
        if (gameCopy.turn() === "w") {
            updateGameState({
                moveNumber: gameState["moveNumber"] + 1,
            });
        }
    });

    // This will occur only when player reconnects
    useSocketEmit(socket, "gameDataResponse", (gameData) => {
        console.log("Received game data response:", gameData);
        setGame(new Chess(gameData.game.fen()));
    });

    useSocketEvent(socket, "gameOver", ({ winner, reason }) => {
        // Handle game over logic here (e.g., show a message, reset the game, etc.)
        // updateGameState({});
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
            gameStatus: "room full",
        });
    });

    useSocketEvent(socket, "roomClosed", (_) => {
        console.log("Game room closed");
        setGame(new Chess()); // Reset the game state
    });

    function makeAMove(sourceSquare, targetSquare) {
        try {
            const movee = {
                from: sourceSquare,
                to: targetSquare,
                promotion: "q", // always promote to a queen for example simplicity
            };
            // console.log(movee);
            const gameCopy = new Chess(game.fen());
            // let result;
            try {
                const result = gameCopy.move(movee);
                // console.log(result);
                // console.log(gameState["playerColor"]);
                const playerColor =
                    gameState["playerColor"] === "white" ? "w" : "b";
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
        //IMP: To make it responsive, have to try copilot approach.
        <div
            id="chessboard"
            className="col-start-2 row-start-2 col-end-3 row-end-3 w-full h-full flex flex-col justify-center items-center p-2"
        >
            {console.log("rerendering chessboard.jsx")}
            <div className="w-[min(calc(100vw-2rem),calc(100vh-20rem),350px)] md:w-[min(calc(100vw-2rem),calc(100vh-20rem),450px)] lg:w-[min(calc(100vw-2rem),calc(100vh-20rem),550px)] xl:w-[min(calc(100vw-2rem),calc(100vh-20rem),1050px)] aspect-square">
            <div id="opponent-info" className="flex flex-row items-center justify-between w-full mb-[2%]">
                    <span className="text-lg text-center font-bold">
                        {gameState["opponentName"] || "Opponent"}
                    </span>
                    <TimerProvider>
                        <Timer
                            side={
                                gameState["playerColor"] === "white"
                                    ? "black"
                                    : "white"
                            } // Pass the opposite side for the opponent's timer
                        />
                    </TimerProvider>
                </div>
                <div id="board-container" className="flex justify-center items-center aspect-square">
                    {console.log("rerendering Chessboard from 130 line.")}
                    <Chessboard
                        // boardWidth={100}
                        customBoardStyle={{}} // Set the board size to 50vh
                        customDarkSquareStyle={{ backgroundColor: "#254CA7" }} // Dark square color
                        customLightSquareStyle={{ backgroundColor: "#CFDCFC" }} // Light square color
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
                <div id="player-info" className="flex flex-row items-center justify-between w-full mt-[2%]">
                    <span className="text-lg text-center font-bold">
                        {gameState["playerName"] || "You"}
                    </span>
                    <TimerProvider>
                        <Timer
                            side={gameState["playerColor"]} // Pass the player's side for their timer
                        />
                    </TimerProvider>
                </div>
            </div>
        </div>
    );
})
