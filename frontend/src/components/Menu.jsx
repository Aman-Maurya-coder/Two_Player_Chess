import { useRef, useEffect, useState } from "react";
import "../assets/MenuStyle.css";
import { useSocketEmit } from "../hooks/useSocketEmit";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { NewGameOptions } from "./gameOptions/NewGameOptions";
import { InGameOptions } from "./gameOptions/InGameOptions";
import { useGameContext, useGameOptionsContext, usePlayerContext } from "../context";
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
        <div className={classes + " items-center box-border"}>
            <div className="w-full h-full sm:w-[80vw] sm:h-[60vh] md:w-[60vw] md:h-[50vh] lg:w-[50vw] lg:h-[40vh] border-2 border-border overflow-hidden p-5 rounded-lg bg-card">
                {menuView === "default" && (
                    <div className="flex flex-col justify-center items-center gap-7 w-full h-full">
                        <Button size="mine" variant="default" onClick={handleNewGame}>
                            New Game
                        </Button>
                        <Button size="mine" variant="outline" onClick={handleJoinGame}>
                            Join Game
                        </Button>
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
                            <Button size={"md"} onClick={() => setMenuView("default")} variant={"outline"}>
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