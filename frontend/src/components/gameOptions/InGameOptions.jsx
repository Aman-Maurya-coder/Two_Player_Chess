import React, { useState } from 'react'
import { useGameContext, useGameOptionsContext, useSocketContext } from '../../context'
import { useSocketEvent } from '../../hooks/useSocketEvent';
import { useSocketEmit } from '@/hooks/useSocketEmit';
import { Button } from '@/components/ui/button';



function InGameOptions({socket, setMenuView}) {
  // const {socket} = useSocketContext();
  // console.log("now in inGameOptions");
  const { gameState } = useGameContext();
  const emitEvent = useSocketEmit(socket);
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
    emitEvent("closeRoom",{
      "gameId": gameState["gameId"]
    })
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
    </div>
  )
}

export {InGameOptions}
