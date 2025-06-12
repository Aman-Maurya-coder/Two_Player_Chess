import "./App.css";
import { io } from "socket.io-client";
// import { useState } from "react";
import { Board } from "./components/ChessBoard";
import { Navbar } from "./components/Navbar";
import { Menu } from "./components/Menu";
import { Footer } from "./components/Footer";
import { GameOverPopup } from "./components/GameOverPopup";
// import { useGameState } from "../hooks/useGameState";
import { ContextProvider } from "./context";
import { useGameContext } from "./context/GameContext";


const socket = io("http://localhost:3000");

function App() {
    const {gameState, updateGameState} = useGameContext();
    return (
        <>
            {/* <ContextProvider> */}
                <Navbar></Navbar>
                {gameState.gameStatus !== "not started" || gameState.gameStatus !== "playing" && <GameOverPopup />}
                <div className="game">
                    <Board
                        socket={socket}
                        gameStatus={gameState.gameStatus}
                        onGameStatusChange={(status) => updateGameState({gameStauts: status})}
                        moveNumber={gameState.moveNumber}
                        setMoveNumber={(prevMoveNumber) => updateGameState({moveNumber: prevMoveNumber + 1})}
                    />
                    <Menu
                        gameStatus={gameState.gameStatus}
                        onStart={() => updateGameState({gameStatus: "playing"})}
                    />
                </div>
                <Footer></Footer>
            {/* </ContextProvider> */}
        </>
    );
}

export default App;
