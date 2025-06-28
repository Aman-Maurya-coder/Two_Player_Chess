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
    classes,
    menuView = "default",
    setMenuView,
    layoutView = "landing",
    setLayoutView,
}) {
    const joinGameRef = useRef(null);
    const { playerId } = usePlayerContext();
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

    useSocketEvent(socket, "playerJoinedRoom", (gameId) => {
        updateGameState({ gameId: gameId });
        emitEvent("roomData", { gameId: gameId });
    });
    useSocketEvent(socket, "roomJoiningFailed", () => setMenuView("default"));
    useSocketEvent(socket, "roomDataResponse", (gameData) => {
        const playerSide =
            gameData["roomPlayers"]["white"] === playerId ? "white" : "black";
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
    useSocketEvent(socket, "gameNotFound", () => setMenuView("default"));
    useSocketEvent(socket, "gameFull", () => setMenuView("default"));

    const handleNewGame = () => setMenuView("newGameOptions");
    const handleJoinGame = () => setMenuView("joinGameOptions");
    const handleGameCodeSubmit = () => {
        const localPlayerId = JSON.parse(localStorage.getItem("playerId"));
        if (!localPlayerId) {
            setMenuView("default");
            return;
        }
        emitEvent("joinGame", {
            roomId: gameCode,
            playerId: localPlayerId,
        });
    };

    return (
        <div id="menu" className={classes}>
            <div className="w-full p-5 h-[90%]">
                {menuView === "default" && (
                    <div
                        id="landingOptions"
                        className="flex flex-col w-full h-full box-border"
                    >
                        <div id="heading" className="flex flex-2/5 justify-center items-end">
                            <h1 className="text-6xl/22 h-min font-semibold tracking-tighter text-center inline lg:text-6xl/18 lg:text-left xl:text-7xl/20 2xl:text-6xl/18">
                                Welcome to
                                <span className="text-6xl/22 font-semibold tracking-tighter bg-gradient-to-r from-primary to-accent inline text-transparent bg-clip-text lg:text-6xl/18 xl:text-7xl/20 2xl:text-6xl/18">
                                    {" "}
                                    Two Player Chess
                                </span>
                            </h1>
                        </div>
                        <div id="sub-heading" className="flex-1/5 flex justify-center items-start lg:justify-start">
                            <h3 className="text-xl/25 font-sans inline text-center text-muted font-semibold tracking-wide lg:text-xl/20 lg:text-left xl:text-2xl/22 2xl:text-xl/20">
                                Create.Share.Play.Repeat
                            </h3>
                        </div>
                        <div id="hero-buttons" className="flex flex-2/5 flex-col w-full h-full justify-center items-center space-y-15 sm:flex-row sm:space-y-0 sm:justify-around lg:justify-between lg:items-start lg:pt-15 lg:space-x-5">
                            <Button
                                variant="hero"
                                size="hero"
                                onClick={handleNewGame}
                                className="text-primary-foreground"
                            >
                                New Game
                            </Button>
                            <Button
                                variant="hero_outline"
                                size="hero"
                                onClick={handleJoinGame}
                                className="text-foreground"
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
                    <div className="flex flex-col justify-center items-center gap-9 h-full w-full">
                        <Input
                            type={"text"}
                            placeholder="Enter Game Code"
                            value={gameCode}
                            onChange={(e) => setGameCode(e.target.value)}
                            className={"dark:text-3xl dark:h-14 w-sm dark"}
                            ref={joinGameRef}
                        />
                        <div className="flex flex-row-reverse justify-between w-sm">
                            <Button size={"md"} onClick={handleGameCodeSubmit}>
                                Submit
                            </Button>
                            <Button
                                size={"md"}
                                onClick={() => setMenuView("default")}
                                variant={"outline"}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                )}

                {menuView === "inGameOptions" && (
                    <InGameOptions socket={socket} setMenuView={setMenuView} />
                )}
            </div>
        </div>
    );
}
