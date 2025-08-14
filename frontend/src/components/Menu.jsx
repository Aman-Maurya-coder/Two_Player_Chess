import { useRef, useEffect, useState } from "react";
import "../assets/MenuStyle.css";
import { useSocketEmit } from "../hooks/useSocketEmit";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { NewGameOptions } from "./gameOptions/NewGameOptions";
import { InGameOptions } from "./gameOptions/InGameOptions";
import {
    useGameContext,
    useGameOptionsContext,
    usePlayerContext,
} from "../context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as motion from "motion/react-client"
import { animate, easeInOut } from "motion";

export function Menu({
    socket,
    menuView = "default",
    setMenuView,
    layoutView = "landing",
    setLayoutView,
}) {
    const joinGameRef = useRef(null);
    const { playerId, updatePlayerData } = usePlayerContext();
    const { updateGameOptions } = useGameOptionsContext();
    const { updateGameState } = useGameContext();
    const emitEvent = useSocketEmit(socket);

    const [gameCode, setGameCode] = useState("");

    useEffect(() => {
        if (menuView === "joinGameOptions" && joinGameRef.current) {
            requestAnimationFrame(() => {
                joinGameRef.current.focus();
            });
        }
    }, [menuView]);
    // Listening event for the player who is joining the room
    useSocketEvent(socket, "roomJoined", ({gameId, gameStatus, playerSide, timeControl}) => {
        console.log("Player joined room with gameId:", gameId);
        updatePlayerData({gameId: gameId});
        updateGameState({ gameId: gameId, "gameStatus": gameStatus, playerColor: playerSide });
        updateGameOptions({
            "time": timeControl 
        })
        console.log("emitting roomData event with gameId:", gameId);
        emitEvent("roomData", { gameId: gameId });
    });
    useSocketEvent(socket, "roomJoiningFailed", () => setMenuView("default"));
    useSocketEvent(socket, "roomDataResponse", (gameData) => {
        console.log("Received room data response:", gameData);
        const playerSide = gameData["roomPlayers"]["white"] === playerId ? "white" : "black";
        updateGameState({
            gameStatus: gameData["gameStatus"],
            moveNumber: gameData["moveNumber"],
            playerColor: playerSide,
        });
        updateGameOptions({
            time: gameData["gameTimer"][playerSide],
            increment: gameData["gameTimer"]["increment"],
            playerSide: playerSide,
        });
        setMenuView("inGameOptions");
    });
    useSocketEvent(socket, "gameNotFound", () => {
        console.log("Game not found, returning to default menu view");
        setMenuView("default");
    });
    useSocketEvent(socket, "gameFull", () => {
        console.log("Game is full, returning to default menu view");
        setMenuView("default");
    });

    const handleNewGame = () => setMenuView("newGameOptions");
    const handleJoinGame = () => setMenuView("joinGameOptions");
    const handleGameCodeSubmit = () => {
        const localPlayerId = JSON.parse(localStorage.getItem("playerId"));
        if (!localPlayerId) {
            console.log("Player ID not found in local storage");
            setMenuView("default");
            return;
        };
        console.log("Joining game with code:", gameCode);
        emitEvent("joinGame", {
            roomId: gameCode,
            playerId: localPlayerId,
        });
    };
    

    return (
        <div
            id="menu"
            className={`lg:order-2 flex justify-center ${
                menuView === "newGameOptions" || menuView === "joinGameOptions"
                    ? "m-[calc(100vh*0.04)] lg:m-0"
                    : "m-[6%] lg:mr-[12%] lg:m-0"
            } h-full overflow-x-hidden`}
        >
            {menuView === "default" && (
                <div
                    id="landingOptions"
                    className="my-auto" //flex flex-col w-full h-full box-border
                >
                    <div
                        id="heroHeading"
                        className="flex justify-center items-center mx-auto md:mb-8 lg:mb-2"
                    >
                        <h1 className="text-4xl/13 text-foreground font-black font-fraunces tracking-normal text-center inline md:text-6xl/11 md:font-semibold lg:text-left lg:text-3xl/12 lg:tracking-wide ">
                            Welcome to
                            <span className="font-fraunces text-foreground text-4xl/13 font-black tracking-normal inline md:bg-gradient-to-b md:from-foreground md:to-highlight md:text-transparent md:bg-clip-text md:from-40% md:to-80% md:text-5xl/11 md:font-bold md:tracking-normal lg:text-3xl/12 lg:tracking-wide">
                                {" "}
                                Two Player Chess
                            </span>
                        </h1>
                    </div>
                    <div
                        id="sub-heading"
                        className="flex justify-center items-start lg:justify-start md:mb-[15%]"
                    >
                        <h3 className="text-highlight text-xl/13 font-fraunces inline text-center font-bold tracking-tight md:text-2xl/13 lg:text-left lg:text-lg/13">
                            Create Share Play
                        </h3>
                    </div>
                    <div
                        id="hero-buttons"
                        className="grid grid-cols-[calc(7%)_1fr_calc(10%)_1fr_calc(7%)] w-full h-full items-center bottom-0 lg:grid-cols-[1fr_calc(10%)_1fr]"
                    >
                        <Button
                            size="ui"
                            onClick={handleNewGame}
                            className="text-foreground col-start-2 col-end-3 md:shadow-button lg:col-start-1 lg:col-end-2"
                        >
                            New Game
                            {/* <p className="p-0 m-0"></p> */}
                        </Button>
                        <Button
                            variant="outline"
                            size="ui"
                            onClick={handleJoinGame}
                            className="text-foreground col-start-4 col-end-5 md:shadow-button lg:col-start-3 lg:col-end-4 box-border"
                            asChild
                        >
                            <motion.button
                                whileHover={{
                                  scale: 1.01,
                                  borderColor: "#3b82f6", // blue-500
                                  transition: { duration:0.1  }
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Join Game
                            </motion.button>
                            {/* Join Game */}
                        </Button>
                    </div>
                </div>
            )}

            {menuView === "newGameOptions" && (
                <NewGameOptions socket={socket} setMenuView={setMenuView} />
            )}

            {menuView === "joinGameOptions" && (
                <div id="join-game" className="my-auto w-full md:w-[90%] md:flex md:flex-col md:h-[90%] lg:h-[70%] ">
                    <div className="flex justify-start items-start md:flex-1/3 md:items-end md:mb-4 lg:mb-2 ">
                        <h3 className="text-lg md:text-3xl font-fraunces font-regular lg:text-lg">
                            Room Code :
                        </h3>
                    </div>
                    <Input
                        type={"text"}
                        placeholder="Enter Room Code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                        className="text-black rounded-[10px] bg-foreground md:h-18 lg:h-10 " //my-3 text-2xl h-16 text-foreground border-[hsl(26,9%,40%)] border placeholder:text-[#B5A89E] focus-visible:shadow-primary bg-background
                        ref={joinGameRef}
                    />
                    <div className="grid grid-cols-[calc(7%)_1fr_calc(10%)_1fr_calc(7%)] items-center bottom-0 md:grid-cols-[calc(35%)_1fr_calc(35%)] md:flex-3/5 md:items-end lg:grid-cols-[calc(45%)_1fr_calc(45%)] lg:pb-15 ">
                        <Button
                            variant="outline"
                            size={"ui"}
                            className="col-start-2 col-end-3 text-foreground md:col-start-1 md:col-end-2 md:shadow-button"
                            onClick={() => setMenuView("default")}
                        >
                            Back
                        </Button>
                        <Button
                            size={"ui"}
                            className="col-start-4 col-end-5 text-foreground md:col-start-3 md:shadow-button"
                            onClick={handleGameCodeSubmit}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
