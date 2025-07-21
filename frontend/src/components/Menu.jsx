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
    useSocketEvent(socket, "roomJoined", ({gameId, gameStatus, playerSide}) => {
        console.log("Player joined room with gameId:", gameId);
        updatePlayerData({gameId: gameId});
        updateGameState({ gameId: gameId, "gameStatus": gameStatus, playerColor: playerSide });
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
                    ? "m-[calc(100vh*0.04)]"
                    : "m-[6%]"
            } h-full overflow-x-hidden`}
        >
            {menuView === "default" && (
                <div
                    id="landingOptions"
                    className="my-auto" //flex flex-col w-full h-full box-border
                >
                    <div
                        id="heroHeading"
                        className="flex justify-center items-center mx-auto"
                    >
                        <h1 className="text-4xl/13 text-foreground font-black font-fraunces tracking-normal text-center inline lg:text-left lg:text-6xl/19 ">
                            Welcome to
                            <span className="font-fraunces text-foreground text-4xl/13 font-black tracking-normal inline lg:text-6xl/19">
                                {" "}
                                Two Player Chess
                            </span>
                        </h1>
                    </div>
                    <div
                        id="sub-heading"
                        className="flex justify-center items-start lg:justify-start"
                    >
                        <h3 className="text-highlight text-xl/13 font-fraunces inline text-center font-bold tracking-tight lg:text-left">
                            Create.Share.Play.Repeat
                        </h3>
                    </div>
                    <div
                        id="hero-buttons"
                        className="grid grid-cols-[calc(7%)_1fr_calc(10%)_1fr_calc(7%)] w-full h-full items-center bottom-0"
                    >
                        <Button
                            size="ui"
                            onClick={handleNewGame}
                            className="text-foreground col-start-2 col-end-3"
                        >
                            <p className="p-0 m-0">New Game</p>
                        </Button>
                        <Button
                            variant="outline"
                            size="ui"
                            onClick={handleJoinGame}
                            className="text-foreground col-start-4 col-end-5"
                        >
                            Join Game
                        </Button>
                    </div>
                </div>
            )}

            {menuView === "newGameOptions" && (
                <NewGameOptions socket={socket} setMenuView={setMenuView} />
            )}

            {menuView === "joinGameOptions" && (
                <div id="join-game" className="my-auto w-full">
                    <div className="flex justify-start items-start">
                        <h3 className="text-lg font-fraunces font-bold">
                            Room Code:
                        </h3>
                    </div>
                    <Input
                        type={"text"}
                        placeholder="Enter Room Code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                        className="text-black rounded-[10px] bg-foreground" //my-3 text-2xl h-16 text-foreground border-[hsl(26,9%,40%)] border placeholder:text-[#B5A89E] focus-visible:shadow-primary bg-background
                        ref={joinGameRef}
                    />
                    <div className="grid grid-cols-[calc(7%)_1fr_calc(10%)_1fr_calc(7%)] items-center bottom-0">
                        <Button
                            variant="outline"
                            size={"ui"}
                            className="col-start-2 col-end-3 text-foreground"
                            onClick={() => setMenuView("default")}
                        >
                            Back
                        </Button>
                        <Button
                            size={"ui"}
                            className="col-start-4 col-end-5 text-foreground"
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
