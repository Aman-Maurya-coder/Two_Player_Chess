//NOTE: have to implement the dialog box for promotion.

import React, { useState, useRef, useCallback, useEffect } from "react";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSocketEmit } from "../../hooks/useSocketEmit.js";
import { useSocketEvent } from "../../hooks/useSocketEvent.js";
import {
    usePlayerContext,
    useGameContext,
    useGameOptionsContext,
    useTimerContext,
} from "../../context/index.jsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button.jsx";
import { Label } from "@/components/ui/label.jsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx";
import { Input } from "@/components/ui/input.jsx";
import { AlertDialogBox } from "../utils/AlertDialogBox.jsx";
import { DialogBox } from "../utils/DialogBox.jsx";

const timer_options = [
    {
        label: "5 min",
        value: "5",
    },
    {
        label: "10 min",
        value: "10",
    },
    {
        label: "15 min",
        value: "15",
    },
    {
        label: "30 min",
        value: "30",
    },
];
const increment_options = [
    {
        label: "0 sec",
        value: "0",
    },
    {
        label: "2 sec",
        value: "2",
    },
    {
        label: "5 sec",
        value: "5",
    },
    {
        label: "10 sec",
        value: "10",
    }
];
const playerSideOptions = [
    {
        label: "White",
        value: "white",
    },
    {
        label: "Black",
        value: "black",
    }
];

const formSchema = z.object({
    time_control: z.enum(timer_options.map((option) => option.value), {
        error: "Time should be one of the options",
    }),
    increment: z.enum(increment_options.map((option) => option.value), {
        error: "Increment should be one of the options",
    }),
    player_side: z.enum(playerSideOptions.map((option) => option.value)),
});

function NewGameOptions({ socket, setMenuView }) {
    // const {socket} = useSocketContext();
    // console.log(socket);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            time_control: timer_options[0].value, // Default value for time control
            increment: increment_options[0].value, // Default value for increment
            player_side: playerSideOptions[0].value, // Default value for player side
        },
    });
    const { playerId, playerData, updatePlayerData } = usePlayerContext();
    const { gameState, updateGameState } = useGameContext();
    const { updateGameOptions } = useGameOptionsContext();
    const { setWhiteTime, setBlackTime } = useTimerContext();
    const [dialogState, setDialogState] = useState(false); // State to control the dialog visibility
    const [dialogContent, setDialogContent] = useState({}); // State to hold dialog content
    const gameIdRef = useRef(null);

    // Ensure playerId is available before proceeding
    if (!playerId) {
        console.error("Player ID is not set. Cannot create a new game.");
        setMenuView("default");
        return null; // or handle the error as needed
    }
    const emitEvent = useSocketEmit(socket);

    useEffect(() => {
        if (dialogState && gameIdRef.current) {
            requestAnimationFrame(() => {
                gameIdRef.current.focus();
                gameIdRef.current.select();
            });
        }
    }, [dialogState]);

    useSocketEvent(socket, "gameRoomCreated", ({ gameId, gameData }) => {
        console.log("player joined the new game room :", gameId, gameData);
        updatePlayerData({
            gameId: gameId
        })
        updateGameState({
            gameStatus: gameData["gameStatus"],
            gameId: gameId,
            gameStatus: gameData["gameStatus"],
            moveNumber: gameData["moveNumber"],
            playerColor:
                gameData["roomPlayers"]["white"] === playerId
                    ? "white"
                    : "black",
        });
        setWhiteTime(gameData["gameTimer"]["white"]);
        setBlackTime(gameData["gameTimer"]["black"]);
        // console.log(gameState);
        setDialogContent({
            title: "Your Game Code",
            desc: "Share this code with your friend to play with them.",
            content: (
                <div id="content" className="flex w-full items-center gap-2 mb-2">
                    <Input
                        readOnly
                        type="text"
                        value={gameId || ""}
                        placeholder="Game Code"
                        className="flex-3/4 h-fit px-10 rounded-full text-lg text-foreground shadow-input border border-[hsl(26,9%,40%)] placeholder:text-[#B5A89E]"
                        ref={gameIdRef}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="submit"
                                className={"flex-1/4 rounded-full"}
                                onClick={() => {
                                    window.navigator.clipboard.writeText(
                                        gameIdRef.current.value
                                    );
                                }}
                            >
                                Copy
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="flex justify-center items-center w-28 h-6 text-sm">
                            <p>Code Copied</p>
                        </PopoverContent>
                    </Popover>
                </div>
            ),
            onClose: () => setMenuView("inGameOptions"),
        });
        // console.log("dialog State:", dialogState);
        // setDialogState(true); // Open the dialog to show the game code
        setDialogState(true); // This ensures React recognizes the state change
        // console.log("dialog State:", dialogState);
    });

    const onSubmit = useCallback(
        (data) => {
            console.log("Form submitted with data:", data, playerData);
            if (playerData?.gameId) {
                console.warn(
                    "Player is already in a game, cannot create a new game."
                );
                setDialogContent({
                    title: "Already in a Game",
                    desc: "You are already in a game. Please finish your current game before starting a new one.",
                });
                setDialogState(true);
                return; // Prevent creating a new game if the player is already in one
            }
            emitEvent("newGame", {
                playerId: playerId,
                playerSide: data["player_side"],
                timeControl: {
                    time: data["time_control"],
                    increment: data["increment"],
                },
            });
            console.log("newGame event emmitted");
            updateGameOptions({
                time: data["time_control"],
                increment: data["increment"],
                playerSide: data["player_side"],
            });
        },
        [playerId, playerData]
    );

    return (
        <div className="h-full w-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid h-full grid-rows-[25%_25%_25%_25%]"
                >
                    <FormField
                        control={form.control}
                        name="time_control"
                        id="time_control"
                        render={({ field }) => (
                            <FormItem className="">
                                <FormLabel htmlFor="time_control">
                                    Time Control
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        {timer_options.map((option) => (
                                            <RadioGroupItem 
                                                key={option.value}
                                                value={option.value}
                                                id={`t${option.value}`}
                                                className="flex justify-center items-center ring-[1px] ring-border data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500"
                                            >
                                                <span 
                                                    htmlFor={`t${option.value}`} 
                                                    className="text-md/2 font-bold tracking-tight"
                                                >
                                                    {option.label}
                                                </span>
                                            </RadioGroupItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="increment"
                        id="increment"
                        render={({ field }) => (
                            <FormItem className="">
                                <FormLabel htmlFor="increment">
                                    Increment
                                </FormLabel>
                                <FormControl>
                                <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        {increment_options.map((option) => (
                                            <RadioGroupItem 
                                                key={option.value}
                                                value={option.value}
                                                id={`i${option.value}`}
                                                className="flex justify-center items-center ring-[1px] ring-border py-1 px-3 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500"
                                            >
                                                <span 
                                                    htmlFor={`i${option.value}`}
                                                    className="text-md font-semibold tracking-tight"
                                                >
                                                    {option.label}
                                                </span>
                                            </RadioGroupItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="player_side"
                        id="player_side"
                        render={({ field }) => (
                            <FormItem className="">
                                <FormLabel htmlFor="player_side">
                                    Your Side
                                </FormLabel>
                                <FormControl>
                                <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        {playerSideOptions.map((option) => (
                                            <RadioGroupItem 
                                                key={option.value}
                                                value={option.value}
                                                id={`p${option.value}`}
                                                className="flex justify-center items-center ring-[1px] ring-border py-1 px-3 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500"
                                            >
                                                <span 
                                                    htmlFor={`p${option.value}`}
                                                    className="text-md font-semibold tracking-tight"
                                                >
                                                    {option.label}
                                                </span>
                                            </RadioGroupItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-[calc(7%)_1fr_calc(10%)_1fr_calc(7%)] items-center">
                        <Button
                            type="button"
                            variant="outline"
                            size={"ui"}
                            onClick={() => {
                                setDialogState(false); // Close the dialog if open
                                setTimeout(() => setMenuView("default"), 50);
                            }}
                            className="col-start-2 col-end-3 text-foreground"
                        >
                            Back
                        </Button>
                        <Button type="Submit" className="col-start-4 col-end-5 text-foreground" size={"ui"}>
                            Submit
                        </Button>
                    </div>
                </form>
            </Form>
            <DialogBox
                dialogOpen={dialogState}
                setDialogOpen={setDialogState}
                title={dialogContent.title}
                desc={dialogContent.desc}
                {...(dialogContent.content && {
                    content: dialogContent.content,
                })}
                {...(dialogContent.onClose && {
                    onClose: dialogContent.onClose,
                })}
            />
        </div>
    );
}

export { NewGameOptions };
