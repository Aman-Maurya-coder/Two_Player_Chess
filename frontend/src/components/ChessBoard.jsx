import { useState, memo, useCallback } from "react";
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
export const Board = memo(function Board({ socket }) {
    // ${window.innerHeight > window.innerWidth ? "" : "w-[50vh]"} have to check it for resizing of the board.

    const { game, gameState, updateGameState, resetGameState } = useGameContext();
    const { gameOptions } = useGameOptionsContext();
    const emitEvent = useSocketEmit(socket);

    const [chessPosition, setChessPosition] = useState(game.fen());
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});

    const getMoveOptions = useCallback((square) => {
        // get the moves for the square
        if (game.turn() !== (gameOptions.playerSide === "white" ? "w" : "b")) {
            // if it's not the player's turn, clear the option squares and return false
            setOptionSquares({});
            return false;
        }
        const moves = game.moves({
            square,
            verbose: true,
        });
        console.log("Moves for square:", square,":\n", moves);

        // if no moves, clear the option squares
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        // create a new object to store the option squares
        const newSquares= {};

        // loop through the moves and set the option squares
        for (const move of moves) {
            newSquares[move.to] = {
                background:
                    game.get(move.to) &&
                    game.get(move.to)?.color !==
                        game.get(square)?.color
                        ? "radial-gradient(circle, rgba(0,0,0,.2) 85%, transparent 85%)" // larger circle for capturing
                        : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                // smaller circle for moving
                borderRadius: "50%",
            };
        }

        // set the square clicked to move from to yellow
        newSquares[square] = {
            background: "rgba(7, 148, 219, 1)",
        };

        // set the option squares
        setOptionSquares(newSquares);

        // return true to indicate that there are move options
        return true;
    },[game, optionSquares, gameOptions.playerSide]);

    const onSquareClick = useCallback((square, piece) => {
        // piece clicked to move
        if (!moveFrom && !piece) {
            return;
        }

        if (!moveFrom && piece) {
            // get the move options for the square
            const hasMoveOptions = getMoveOptions(square);

            // if move options, set the moveFrom to the square
            if (hasMoveOptions) {
                setMoveFrom(square);
            }

            // return early
            return;
        }

        // square clicked to move to, check if valid move
        const moves = game.moves({
            square: moveFrom,
            verbose: true,
        });
        const foundMove = moves.find(
            (m) => m.from === moveFrom && m.to === square
        );

        // not a valid move
        if (!foundMove) {
            // check if clicked on new piece
            const hasMoveOptions = getMoveOptions(square);

            // if new piece, setMoveFrom, otherwise clear moveFrom
            setMoveFrom(hasMoveOptions ? square : "");

            // return early
            return;
        }

        // is normal move
        try {
            const gameCopy = new Chess(chessPosition);
            gameCopy.move({
                from: moveFrom,
                to: square,
                promotion: "q",
            });
        } catch {
            // if invalid, setMoveFrom and getMoveOptions
            const hasMoveOptions = getMoveOptions(square);

            // if new piece, setMoveFrom, otherwise clear moveFrom
            if (hasMoveOptions) {
                setMoveFrom(square);
            }

            // return early
            return;
        }

        // update the position state
        const movee = game.move({
            from: moveFrom,
            to: square,
            promotion: 'q'
        });
        emitEvent("move", {
            move: movee,
            gameId: gameState["gameId"], // Assuming gameId is available in the scope
        });
        // setChessPosition(chessGame.fen());

        // clear moveFrom and optionSquares
        setMoveFrom("");
        setOptionSquares({});
    },[moveFrom, game, gameState, gameOptions.playerSide, emitEvent]);

    useSocketEvent(socket, "moveMade", ({ fen, _ }) => {
        setChessPosition(fen);
        game.load(fen); // Update the chess instance with the new FEN
        if (game.moveNumber() == 1) {
            updateGameState({
                gameStatus: "playing",
            });
        }
        if (game.turn() === "w") {
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
    
        // Store values to preserve
        const preservedData = {
            gameId: gameState.gameId,
            playerColor: gameState.playerColor
        };
        
        // Reset using context method
        resetGameState();
        
        // Restore preserved data
        updateGameState({
            ...preservedData,
            gameStatus: "room full"
        });
        
        // Sync visual board
        setChessPosition(game.fen());
        setMoveFrom("");
        setOptionSquares({});
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
            className="col-start-2 row-start-2 col-end-3 row-end-3 w-full h-full flex flex-col justify-center items-center p-2 md:p-0 md:justify-start lg:row-start-1 lg:row-end-4"
        >
            <div className="h-full flex flex-col justify-center">
                <div
                    id="opponent-info"
                    className="flex flex-row items-center justify-between w-full mb-[2%] md:mb-[5%]"
                >
                    <span className="text-lg text-center font-bold lg:text-base">
                        {gameState["opponentName"] || "Opponent"}
                    </span>
                    {/* <TimerProvider> */}
                    <Timer
                        side={
                            gameState["playerColor"] === "white"
                                ? "black"
                                : "white"
                        } // Pass the opposite side for the opponent's timer
                    />
                    {/* </TimerProvider> */}
                </div>
                <div
                    id="board-container"
                    className="flex justify-center items-center  w-[min(calc(100vw-4rem),calc(100vh-20rem),350px)] md:w-[min(calc(100vw-2rem),calc(100vh-20rem),450px)] lg:w-[min(calc(100vw-2rem),calc(100vh-12rem),550px)] xl:w-[min(calc(100vw-2rem),calc(100vh-15rem),650px)] aspect-square md:shadow-button"
                >
                    <Chessboard
                        customBoardStyle={{}} // Set the board size to 50vh
                        customDarkSquareStyle={{ backgroundColor: "#254CA7" }} // Dark square color
                        customLightSquareStyle={{ backgroundColor: "#CFDCFC" }} // Light square color
                         // Square border style
                        position={chessPosition}
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
                        onSquareClick={gameState["gameStatus"] === "room full" ||
                            gameState["gameStatus"] === "playing" ? onSquareClick : undefined}
                        customSquareStyles={optionSquares} // Apply custom styles to option squares
                    />
                </div>
                <div
                    id="player-info"
                    className="flex flex-row items-center justify-between w-full mt-[2%] md:mt-[5%]"
                >
                    <span className="text-lg text-center font-bold lg:text-base">
                        {gameState["playerName"] || "You"}
                    </span>
                    {/* <TimerProvider> */}
                    <Timer
                        side={gameState["playerColor"]} // Pass the player's side for their timer
                    />
                    {/* </TimerProvider> */}
                </div>
            </div>
        </div>
    );
});
