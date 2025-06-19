import React, { useState } from 'react'
import { useGameContext, useGameOptionsContext, useTimerContext, usePlayerContext } from '../../context'
import { useSocketEvent } from '../../hooks/useSocketEvent';
import { useSocketEmit } from '@/hooks/useSocketEmit';
import { Button } from '@/components/ui/button';
import { AlertDialogBox } from '../utils/AlertDialogBox';
import { set } from 'zod/v4';




function InGameOptions({socket, setMenuView}) {
  // const {socket} = useSocketContext();
  // console.log("now in inGameOptions");
  const { gameState,updateGameState, resetGameState } = useGameContext();
  const { resetGameOptions } = useGameOptionsContext();
  const { resetTimer } = useTimerContext();
  const { resetPlayer } = usePlayerContext();
  
  const emitEvent = useSocketEmit(socket);

  const [ view, setView ] = useState(gameState["gameStatus"]);
  const [ isDialogOpen, setIsDialogOpen ] = useState(false);
  const [ dialogContent, setDialogContent ] = useState({
    title: "Sure?",
    desc: "Are you sure you want to do this?",
    action: "Confirm",
    onAction: () => {},
    onClose: () => setIsDialogOpen(false),
  });

  // if(gameState["gameStatus"] === "room full"){
  //   setView("playing");
  // }
  // else if (gameState["gameStatus"] === "waiting for player 2"){
  //   setView("not started");
  // }
  // else{
  //   setView("game ended");
  // }
  useSocketEvent(socket, "playerJoinedRoom", (message) => {
    setView("room full");
  })

  useSocketEvent(socket, "playerDisconnected", (gameData)=>{
    setView("waiting for reconnection");
  })

  useSocketEvent(socket, "gameOver", ({ winner, reason }) => {
    updateGameState({
      gameStatus: reason,
    })
    setView("game ended");
  })
  useSocketEvent(socket, "gameAborted", (data) => {
    updateGameState({
      gameStatus: data["gameStatus"],
    })
    setView("game ended");
  })
  useSocketEvent(socket, "gameResigned", (data) => {
    updateGameState({
      gameStatus: data["gameStatus"],
    })
    setView("game ended");
  })
  useSocketEvent(socket, "drawOffered", (_) => {
    setDialogContent({
      title: "Draw Offered",
      desc: "Your opponent has offered a draw. Do you accept?",
      action: "Accept Draw",
      onAction: handleAcceptDraw,
      onClose: handleRejectDraw,
    })
    setIsDialogOpen(true);
    console.log("Draw offered by the opponent");
  })
  useSocketEvent(socket, "gameDraw", (data) => {
    console.log("Game ended in a draw");
    setView("game ended");
  })
  useSocketEvent(socket, "drawDenied", (data) => {
    console.log("Draw offer rejected by the opponent");
  })

  function handleAbort(){
    setDialogContent({
      title: "Abort Game",
      desc: "Are you sure you want to abort the game?",
      action: "Abort",
      onAction: onConfirmAbort,
    });
    setIsDialogOpen(true);
  }
  
  function onConfirmAbort(){
    console.log("Aborting the game");
    emitEvent("abort", {
      "gameId": gameState["gameId"]
    })
    // setMenuView("default");
  }

  function handleResign(){
    setDialogContent({
      title: "Resign Game",
      desc: "Are you sure you want to resign the game?",
      action: "Resign",
      onAction: onConfirmResign,
    })
    setIsDialogOpen(true);
  }

  function onConfirmResign(){
    console.log("Resigning the game");
    emitEvent("resign", {
      "gameId": gameState["gameId"]
    })
  }

  function handleOfflerDraw(){
    setDialogContent({
      title: "Offer Draw",
      desc: "Are you sure you want to offer a draw?",
      action: "Offer Draw",
      onAction: onConfirmOfferDraw,
    });
    setIsDialogOpen(true);
    // emitEvent("offerDraw", {
    //   "gameId": gameState["gameId"]
    // });
  }

  function onConfirmOfferDraw(){
    console.log("Offering a draw");
    emitEvent("offerDraw", {
      "gameId": gameState["gameId"]
    });
  }

  function handleAcceptDraw(){
    emitEvent("drawAccepted", {
      "gameId": gameState["gameId"]
    })
  }

  function handleRejectDraw(){
    setIsDialogOpen(false);
    emitEvent("drawRejected", {
      "gameId": gameState["gameId"]
    })
  }

  function exitRoom(){
    emitEvent("closeRoom",{
      "gameId": gameState["gameId"]
    })

    // Reset all game-related states
    resetGameState();
    resetGameOptions();
    resetTimer();
    resetPlayer();

    setMenuView("default");
  }


  return (
    <div className='flex flex-col justify-center items-center h-full w-full'>
      {view === "waiting for player 2" && 
        (
          <div className='flex flex-col justify-around items-center h-full'>
            <div className='flex flex-col flex-6/10 items-center justify-center'>
              <p>Loading...</p>
              <p>Waiting for the Second Player</p>
            </div>
            <div className="flex justify-center items-center flex-4/10">
              <Button onClick={exitRoom} size="mine" className="">Exit Room</Button>
            </div>
          </div>
        )
      }
      {view === "waiting for reconnection" &&
        (
          <div className='flex flex-col justify-around items-center h-full'>
            <div className='flex flex-col flex-6/10 items-center justify-center'>
              <p>Loading...</p>
              <p>Waiting for the Second Player to Reconnect</p>
            </div>
            <div className="flex justify-center items-center flex-4/10">
              <Button onClick={exitRoom} size="mine" className="">Exit Room</Button>
            </div>
          </div>
        )
      }
      {view === "room full" && 
        (
          <div className='flex flex-col justify-around items-center h-full'>
            <div className='flex flex-col flex-6/10 items-center justify-center'>
              <Button size="mine" onClick={gameState["moveNumber"] <= 1 ? handleAbort : handleResign}>{gameState["moveNumber"] <= 1 ? "Abort" : "Resign"}</Button>
            </div>
            <div className="flex justify-center items-center flex-4/10">
              <Button size="mine" onClick={handleOfflerDraw}>Offer Draw</Button>
            </div>
          </div>
        )
      }
      { view === "game ended" && 
        (
          <div className='flex flex-col justify-around items-center h-full'>
            <div className='flex flex-col flex-6/10 items-center justify-center'>
              {/* <button></button> */}
              <Button size="mine">Play Again</Button>
            </div>
            <div className="flex justify-center items-center flex-4/10">
              {/* <button></button> */}
              <Button onClick={exitRoom} size="mine" className="">Exit Room</Button>
            </div>
          </div>
        )
      }
      <AlertDialogBox 
        dialogOpen={isDialogOpen} 
        setDialogOpen={setIsDialogOpen} 
        title={dialogContent.title} 
        desc={dialogContent.desc}
        action={dialogContent.action}
        onAction={dialogContent.onAction}
        onClose={dialogContent.onClose}
      />
    </div>
  )
}

export {InGameOptions}
