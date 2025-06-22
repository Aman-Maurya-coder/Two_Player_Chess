import React, { useState, useEffect } from "react";
import {
    useGameContext,
    useGameOptionsContext,
    useTimerContext,
    usePlayerContext,
} from "../../context";
import { useSocketEvent } from "../../hooks/useSocketEvent";
import { useSocketEmit } from "@/hooks/useSocketEmit";
import { Button } from "@/components/ui/button";
import { AlertDialogBox } from "../utils/AlertDialogBox";
import { DialogBox } from "../utils/DialogBox";
import { Label } from "@/components/ui/label";

function InGameOptions({ socket, setMenuView }) {
    // const {socket} = useSocketContext();
    // console.log("now in inGameOptions");
    const { gameState, updateGameState, resetGameState } = useGameContext();
    const { gameOptions, resetGameOptions } = useGameOptionsContext();
    const { setWhiteTime, setBlackTime, setCurrentTurn, resetTimer } = useTimerContext();
    const { playerId, resetPlayerData } = usePlayerContext();

    const emitEvent = useSocketEmit(socket);

    const [view, setView] = useState(gameState["gameStatus"]);
    const [dialogState, setDialogState] = useState(false);
    const [dialogContent, setDialogContent] = useState({});
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [alertDialogContent, setAlertDialogContent] = useState({
        title: "Sure?",
        desc: "Are you sure you want to do this?",
        action: "Confirm",
        onAction: () => {},
        onClose: () => setIsAlertDialogOpen(false),
    });

    useEffect(() => {
        if (view === "game ended") {
            const winner = gameState["winner"];
            const reason = gameState["reason"];
            if (winner === playerId) {
                setDialogContent({
                    title: "Congratulations!",
                    desc: `You won the game!`,
                });
                setDialogState(true);
            } else {
                setDialogContent({
                    title: "Game Over",
                    desc: `You lost the game.`,
                });
                setDialogState(true);
            }
        }
    }, [view]);

    useSocketEvent(socket, "playerJoinedRoom", (message) => {
        setView("room full");
    });

    useSocketEvent(socket, "playerDisconnected", (gameData) => {
        setView("waiting for reconnection");
    });

    useSocketEvent(socket, "gameOver", ({ winner, reason }) => {
        updateGameState({
            gameStatus: reason,
            winner: winner,
            reason: reason,
        });
        setView("game ended");
    });
    useSocketEvent(socket, "gameAborted", (data) => {
        updateGameState({
            gameStatus: data["gameStatus"],
            reason: data["reason"],
            winner: data["winner"],
        });
        setView("game ended");
    });
    useSocketEvent(socket, "gameResigned", (data) => {
        updateGameState({
            gameStatus: data["gameStatus"],
            reason: data["reason"],
            winner: data["winner"],
        });
        setView("game ended");
    });
    useSocketEvent(socket, "drawOffered", (_) => {
        setAlertDialogContent({
            title: "Draw Offered",
            desc: "Your opponent has offered a draw. Do you accept?",
            action: "Accept Draw",
            onAction: handleAcceptDraw,
            onClose: handleRejectDraw,
        });
        setIsAlertDialogOpen(true);
        console.log("Draw offered by the opponent");
    });
    useSocketEvent(socket, "gameDraw", (data) => {
        console.log("Game ended in a draw");
        updateGameState({
            gameStatus: "draw",
            reason: "draw",
        });
        setView("game ended");
    });
    useSocketEvent(socket, "drawDenied", (data) => {
        console.log("Draw offer rejected by the opponent");
    });
    useSocketEvent(socket, "playAgainOffered", () => {
        setAlertDialogContent({
            title: "Play Again Offered",
            desc: "Your opponent has offered to play again. Do you accept?",
            action: "Accept",
            onAction: handlePlayAgainAccepted,
            onClose: handlePlayAgainRejected
        })
        setIsAlertDialogOpen(true);
        console.log("Play again offered by the opponent");
    })
    useSocketEvent(socket, "gameResetSuccessful", (data) => {
        console.log("Game reset successful, starting a new game");
        if(dialogState){
            setDialogState(false);
        }
        setWhiteTime(gameOptions["time"]);
        setBlackTime(gameOptions["time"]);
        setCurrentTurn("white");
        setView("room full");
    })
    useSocketEvent(socket, "playAgainDenied", () => {
        if(dialogState){
            setDialogState(false);
        }
        setDialogContent({
            title: "Play Again Rejected",
            desc: "Your opponent has rejected the play again request.",
        })
        setDialogState(true);
        console.log("Play again rejected by the opponent");
    })

    function handleAbort() {
        setAlertDialogContent({
            title: "Abort Game",
            desc: "Are you sure you want to abort the game?",
            action: "Abort",
            onAction: onConfirmAbort,
        });
        setIsAlertDialogOpen(true);
    }

    function onConfirmAbort() {
        console.log("Aborting the game");
        emitEvent("abort", {
            playerId: playerId,
            gameId: gameState["gameId"],
        });
        // setMenuView("default");
    }

    function handleResign() {
        setAlertDialogContent({
            title: "Resign Game",
            desc: "Are you sure you want to resign the game?",
            action: "Resign",
            onAction: onConfirmResign,
        });
        setIsAlertDialogOpen(true);
    }

    function onConfirmResign() {
        console.log("Resigning the game");
        emitEvent("resign", {
            playerId: playerId,
            gameId: gameState["gameId"],
        });
    }

    function handleOfflerDraw() {
        setAlertDialogContent({
            title: "Offer Draw",
            desc: "Are you sure you want to offer a draw?",
            action: "Offer Draw",
            onAction: onConfirmOfferDraw,
        });
        setIsAlertDialogOpen(true);
    }

    function onConfirmOfferDraw() {
        console.log("Offering a draw");
        emitEvent("offerDraw", {
            gameId: gameState["gameId"],
        });
    }

    function handleAcceptDraw() {
        emitEvent("drawAccepted", {
            gameId: gameState["gameId"],
        });
    }

    function handleRejectDraw() {
        setIsAlertDialogOpen(false);
        emitEvent("drawRejected", {
            gameId: gameState["gameId"],
        });
    }

	function handlePlayAgain(){
		emitEvent("playAgain", {
            "playerId": playerId,
			"gameId": gameState["gameId"],
		});
        setDialogContent({
            title: "Play Again Offered",
            desc: "Waiting for the opponent's response.",
        })
        setDialogState(true);
        console.log("Play again offered to the opponent");
	}

    function handlePlayAgainAccepted() {
        console.log("Play again accepted by the opponent");
        const gameData = {
            "gameTimer": {
                "white": gameOptions["time"],
                "black": gameOptions["time"],
            },
            "increment": gameOptions["increment"],
        }
        emitEvent("playAgainAccepted", {
            "gameId": gameState["gameId"],
            "gameData": gameData,
        })
    }

    function handlePlayAgainRejected(){
        console.log("Play again rejected by the opponent");
        setIsAlertDialogOpen(false);
        emitEvent("playAgainRejected", {
            "gameId": gameState["gameId"],
        })
    }

    function exitRoom() {
        emitEvent("closeRoom", {
            gameId: gameState["gameId"],
        });

        // Reset all game-related states
        resetGameState();
        resetGameOptions();
        resetTimer();
        resetPlayerData();

        setMenuView("default");
    }

    return (
        <div className="flex flex-col justify-center items-center h-full w-full">
            {view === "waiting for player 2" && (
                <div className="flex flex-col justify-around items-center h-full">
                    <div className="flex flex-col flex-6/10 items-center justify-center">
                        <p>Loading...</p>
                        <p>Waiting for the Second Player</p>
                    </div>
                    <div className="flex justify-center items-center flex-4/10">
                        <Button onClick={exitRoom} size="mine" className="">
                            Exit Room
                        </Button>
                    </div>
                </div>
            )}
            {view === "waiting for reconnection" && (
                <div className="flex flex-col justify-around items-center h-full">
                    <div className="flex flex-col flex-6/10 items-center justify-center">
                        <p>Loading...</p>
                        <p>Waiting for the Second Player to Reconnect</p>
                    </div>
                    <div className="flex justify-center items-center flex-4/10">
                        <Button onClick={exitRoom} size="mine" className="">
                            Exit Room
                        </Button>
                    </div>
                </div>
            )}
            {view === "room full" && (
                <div className="flex flex-col justify-around items-center h-full">
                    <div className="flex flex-col flex-6/10 items-center justify-center">
                        <Button
                            size="mine"
                            onClick={
                                gameState["moveNumber"] <= 1
                                    ? handleAbort
                                    : handleResign
                            }
                        >
                            {gameState["moveNumber"] <= 1 ? "Abort" : "Resign"}
                        </Button>
                    </div>
                    <div className="flex justify-center items-center flex-4/10">
                        <Button size="mine" onClick={handleOfflerDraw}>
                            Offer Draw
                        </Button>
                    </div>
                </div>
            )}
            {view === "game ended" && (
                <div className="flex flex-col justify-around items-center h-full">
                    <div className="flex flex-col flex-6/10 items-center justify-center">
                        {/* <button></button> */}
                        <Label></Label>
                        <Button size="mine" onClick={handlePlayAgain}>Play Again</Button>
                    </div>
                    <div className="flex justify-center items-center flex-4/10">
                        {/* <button></button> */}
                        <Button onClick={exitRoom} size="mine" className="">
                            Exit Room
                        </Button>
                    </div>
                </div>
            )}
            <AlertDialogBox
                dialogOpen={isAlertDialogOpen}
                setDialogOpen={setIsAlertDialogOpen}
                title={alertDialogContent.title}
                desc={alertDialogContent.desc}
                action={alertDialogContent.action}
                onAction={alertDialogContent.onAction}
                onClose={alertDialogContent.onClose}
            />
            <DialogBox
                dialogOpen={dialogState}
                setDialogOpen={setDialogState}
                title={dialogContent.title}
                desc={dialogContent.desc}
                {...(dialogContent.content && {
                    content: dialogContent.content,
                })}
                {...(dialogContent.onClose && {
                    onClose: dialogContent.onClose,
                })}
            />
        </div>
    );
}

export { InGameOptions };
