import "./App.css";
import { io } from "socket.io-client";
import { useState } from "react";
import { Board } from "./components/Chessboard";
import { Navbar } from "./components/Navbar";
import { Menu } from "./components/Menu";
import { Footer } from "./components/Footer";
import { GameOverPopup } from "./components/GameOverPopup";

const socket = io("http://localhost:3000");

function App() {
    const [gameStatus, setGameStatus] = useState("not started");
    const [moveNumber, setMoveNumber] = useState(1);
    const [playerColor, setPlayerColor] = useState("white");
    return (
        <>
            <Navbar></Navbar>
            {gameStatus === "game over" && <GameOverPopup></GameOverPopup>}
            <div className="game">
                <Board
                    gameStatus={gameStatus}
                    onEnd={() => setGameStatus("game over")}
                    moveNumber={moveNumber}
                    setMoveNumber={(prevMoveNumber) => setMoveNumber(prevMoveNumber)}
                />
                <Menu
                    gameStatus={gameStatus}
                    onStart={() => setGameStatus("playing")}
                />
            </div>
            <Footer></Footer>
        </>
    );
}

export default App;
