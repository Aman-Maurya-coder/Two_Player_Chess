import React, { useState } from 'react'
import { useGameContext, useGameOptionsContext, useSocketContext } from '../../context'
import { useSocketEvent } from '../../hooks/useSocketEvent';



function InGameOptions({socket, setMenuView}) {
  // const {socket} = useSocketContext();
  // console.log("now in inGameOptions");
  const { gameState } = useGameContext();
  // console.log(gameState);
  // const { gameOptions } = useGameOptionsContext();
  const [ view, setView ] = useState(gameState["gameStatus"]);

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

  useSocketEvent(socket, "gameOver", (data) => {
    setView("game ended");
  })
  useSocketEvent(socket, "abort", (data) => {
    setView("game ended");
  })
  useSocketEvent(socket, "resign", (data) => {
    setView("game ended");
  })

  function exitRoom(){
    setMenuView("default");
  }


  return (
    <>
      {view === "waiting for player 2" && 
        (
          <p>Waiting for the Second Player</p>
        )
      }
      {view === "waiting for reconnection" &&
        (
          <>
            <p>Waiting for the Second Player to Reconnect</p>
            <button>Leave Room</button>
          </>
        )
      }
      {view === "room full" && 
        (
          <>
            <button>Abort || Resign</button>
            <button>Offer Draw</button>
          </>
        )
      }
      { view === "game ended" && 
        (
          <>
            <button>Play Again</button>
            <button onClick={exitRoom}>Exit Room</button>
          </>
        )
      }
    </>
  )
}

export {InGameOptions}
