import React, { useState } from 'react'
import { useGameContext, useGameOptionsContext, useSocketContext } from '../../context'
import { useSocketEvent } from '../../hooks/useSocketEvent';



function InGameOptions({socket, setMenuView}) {
  // const {socket} = useSocketContext();
  // console.log("now in inGameOptions");
  const { gameState } = useGameContext();
  // console.log(gameState);
  // const { gameOptions } = useGameOptionsContext();
  const [ view, setView ] = useState("not started");

  if(gameState["gameStatus"] === "room full"){
    setView("playing");
  }
  else if (gameState["gameStatus"] === "waiting for player 2"){
    setView("not started");
  }
  // else{
  //   setView("game ended");
  // }
  useSocketEvent(socket, "playerJoinedRoom", (message) => {
    setView("playing");
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
      {view === "not started" && 
        (
          <p>Waiting for the Second Player</p>
        )
      }
      {view === "playing" && 
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
