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

function InGameOptions({ socket, menuView, setMenuView }) {
    // const {socket} = useSocketContext();
    // console.log("now in inGameOptions");
    const { gameState, updateGameState, resetGameState } = useGameContext();
    const { gameOptions, updateGameOptions, resetGameOptions } = useGameOptionsContext();
    const { setWhiteTime, setBlackTime, setCurrentTurn, resetTimer } =
        useTimerContext();
    const { playerId, updatePlayerData, resetPlayerData } = usePlayerContext();

    const emitEvent = useSocketEmit(socket);
    const [view, setView] = useState(gameState["gameStatus"]);
    // console.log(view);
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
                // setDialogContent({
                //     title: "Congratulations!",
                //     desc: `You won the game!` + reason,
                // });
                if (reason === "Player left the game") {
                    setDialogContent((prev) => ({
                        ...prev,
                        onClose: () => {
                            resetGameState();
                            setDialogState(false);
                            setMenuView("default");
                        },
                    }));
                }

                // setDialogState(true);
            } else {
                // setDialogContent({
                //     title: "Game Over",
                //     desc: `You lost the game.` + reason,
                // });
                // setDialogState(true);
            }
        }
    }, [view]);

    // useEffect(() => {
    //     if ( gameState.gameStatus === "room full" ){
    //         console.log("setting view to room full");
    //         setView("room full");
    //     }
    // },[menuView, setView, gameState.gameStatus]);
    //Listening event for the player who is waiting in the room
    useSocketEvent(socket, "playerJoinedRoom", ({ gameId, gameStatus }) => {
        // updatePlayerData({gameId: gameId});
        console.log("player joined room");
        updateGameState({ gameId: gameId, gameStatus: gameStatus });
        setView("room full");
    });

    useSocketEvent(socket, "playerDisconnected", (gameStatusResponse) => {
        updateGameState({
            gameStatus: gameStatusResponse,
        });
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
            onClose: handlePlayAgainRejected,
        });
        setIsAlertDialogOpen(true);
        console.log("Play again offered by the opponent");
    });
    useSocketEvent(socket, "gameResetSuccessful", ({gameData}) => {
        console.log("Game reset successful, starting a new game");
        if (dialogState) {
            setDialogState(false);
        }
        updateGameOptions({
            time: gameData["time"],
            increment: gameData["increment"],
        })
        setWhiteTime(gameData["time"]*60*1000);
        setBlackTime(gameData["time"]*60*1000);
        setCurrentTurn("white");
        setView("room full");
    });
    useSocketEvent(socket, "playAgainDenied", () => {
        if (dialogState) {
            setDialogState(false);
        }
        setDialogContent({
            title: "Play Again Rejected",
            desc: "Your opponent has rejected the play again request.",
        });
        setDialogState(true);
        console.log("Play again rejected by the opponent");
    });

    useSocketEvent(socket, "playerLeftGame", (message) => {
        console.log(message);
        updateGameState({
            gameStatus: "game over",
            reason: "Player left the game",
            winner: playerId,
        });
        resetGameOptions();
        resetTimer();
        resetPlayerData();

        setView("game ended");
    });

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

    function handlePlayAgain() {
        emitEvent("playAgain", {
            playerId: playerId,
            gameId: gameState["gameId"],
        });
        setDialogContent({
            title: "Play Again Offered",
            desc: "Waiting for the opponent's response.",
        });
        setDialogState(true);
        console.log("Play again offered to the opponent");
    }

    function handlePlayAgainAccepted() {
        console.log("Play again accepted by the opponent");
        
        emitEvent("playAgainAccepted", {
            gameId: gameState["gameId"],
        });
    }

    function handlePlayAgainRejected() {
        console.log("Play again rejected by the opponent");
        setIsAlertDialogOpen(false);
        emitEvent("playAgainRejected", {
            gameId: gameState["gameId"],
        });
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
        <div className="col-start-2 md:col-start-3 row-start-3 md:row-start-2 flex flex-col justify-center items-center h-full w-full">
            {/* {console.log(view)} */}
            {(view === "waiting for player 2" ||
                view === "waiting for reconnection" ||
                view === "not started") && (
                <div className="flex flex-col justify-around items-center w-full h-full">
                    <div className="flex flex-col flex-3/5 items-center justify-center">
                        <h3 className="text-xl text-center">Loading...</h3>
                        <h3 className="text-lg text-center">
                            {view === "waiting for reconnection"
                                ? "Waiting for the Second Player to Reconnect"
                                : "Waiting for the Second Player"}
                        </h3>
                    </div>
                    <div className="flex flex-2/5 w-full h-full items-center justify-center">
                        <Button
                            onClick={exitRoom}
                            size="ui"
                            className="px-[10%] py-[3%] font-semibold text-base/5 rounded-[15px] drop-shadow-2xl"
                        >
                            Exit Room
                        </Button>
                    </div>
                </div>
            )}
            {(view === "room full" || view === "playing") && (
                <div className="flex flex-col justify-center items-center w-full h-full gap-5">
                    <Button
                        className="w-[54%] h-[20%] rounded-[15px] bg-highlight text-base/5 font-semibold text-foreground"
                        onClick={
                            gameState["moveNumber"] <= 1
                                ? handleAbort
                                : handleResign
                        }
                    >
                        {gameState["moveNumber"] <= 1 ? "Abort" : "Resign"}
                    </Button>
                    <Button
                        className="w-[54%] h-[20%] rounded-[15px] bg-destructive text-base/5 font-semibold text-foreground"
                        onClick={handleOfflerDraw}
                    >
                        Offer Draw
                    </Button>
                </div>
            )}
            {view === "game ended" && (
                <div className="flex flex-col justify-center items-center h-full w-full">
                    <div className="flex-3/5 flex flex-col justify-center items-center ">
                        <Label className="font-poppins text-3xl font-bold text-highlight leading-12">
                            You{" "}
                            {gameState?.winner === playerId ? "Won" : "Lost"}
                        </Label>
                        <Label className="font-poppins text-base font-normal text-[#999999]">By {gameState?.reason}</Label>
                    </div>
                    <div className="flex-2/5 flex flex-row-reverse justify-between items-center h-full w-full">
                        <div className="flex items-center justify-center w-[45%] h-[55%]">
                            {/* <button></button> */}
                            <Button className="rounded-[15px] w-full h-full" onClick={handlePlayAgain}>
                                Play Again
                            </Button>
                        </div>
                        <div className="flex justify-center items-center w-[45%] h-[55%]">
                            {/* <button></button> */}
                            <Button onClick={exitRoom} variant="outline" className="border-[#2738A5] rounded-[15px] w-full h-full">
                                Exit Room
                            </Button>
                        </div>
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
