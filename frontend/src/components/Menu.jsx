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
        <div id="menu" className={classes + "bg-background p-10"}>
            <div className="w-full overflow-hidden p-5 h-4/6">
                {menuView === "default" && (
                    <div
                        id="landingOptions"
                        className="flex flex-col w-full h-full box-border"
                    >
                        <h1 className="text-6xl/22 font-semibold tracking-tighter text-left inline">
                            Welcome to
                            <span className="text-6xl/22 font-semibold tracking-tighter bg-gradient-to-r from-primary to-accent inline text-transparent bg-clip-text">
                                {" "}
                                Two Player Chess
                            </span>
                        </h1>
                        <h3 className="text-2xl/25 font-sans text-left text-muted font-medium mb-15 tracking-wide">
                            Create.Share.Play.Repeat
                        </h3>
                        <div className="flex flex-row w-full h-full justify-between items-center">
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
