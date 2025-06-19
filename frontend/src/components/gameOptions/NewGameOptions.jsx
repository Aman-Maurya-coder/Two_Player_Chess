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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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

const formSchema = z.object({
    time_control: z.enum(["5", "10", "15", "30"], {
        error: "Time should be one of the options",
    }),
    increment: z.enum(["0", "2", "5", "10"], {
        error: "Increment should be one of the options",
    }),
    player_side: z.enum(["white", "black"]),
});

function NewGameOptions({ socket, setView }) {
    // const {socket} = useSocketContext();
    // console.log(socket);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            time_control: "5", // Default value for time control
            increment: "0", // Default value for increment
            player_side: "white", // Default value for player side
        },
    });
    const { playerId } = usePlayerContext();
    const { gameState, updateGameState } = useGameContext();
    const { updateGameOptions } = useGameOptionsContext();
    const { setWhiteTime, setBlackTime, setCurrentTurn } = useTimerContext();
    const [dialogState, setDialogState] = useState(false); // State to control the dialog visibility
    // const copyButtonRef = useRef(null);
    const gameIdRef = useRef(null);
    // useEffect(() => {
    //     copyButtonRef.current.focus(); // Focus the copy button when the component mounts
    // }, []);

    // Ensure playerId is available before proceeding
    if (!playerId) {
        console.error("Player ID is not set. Cannot create a new game.");
        setView("default");
        return null; // or handle the error as needed
    }
    const emitEvent = useSocketEmit(socket);

    useSocketEvent(socket, "gameRoomCreated", ({ gameId, gameData }) => {
        console.log("player joined the new game room :", gameId, gameData);
        updateGameState({
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
    });

    const onSubmit = (data) => {
        console.log("Form submitted with data:", data);
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
        setDialogState(true); // Open the dialog to show the game code
    };
    return (
        <div className="h-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4 w-full h-full"
                >
                    <FormField
                        control={form.control}
                        name="time_control"
                        render={({ field }) => (
                            <FormItem className="flex-1/4 gap-0">
                                <FormLabel className="text-2xl font-mono">
                                    Time Control
                                </FormLabel>
                                <FormControl>
                                    {/* <Input placeholder="enter time" {...field} /> */}
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-row justify-start items-center"
                                    >
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem
                                                value="5"
                                                id="t5"
                                                className="flex-1/5"
                                            />
                                            <Label
                                                htmlFor="t5"
                                                className="flex-4/5"
                                            >
                                                5 min
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem
                                                value="10"
                                                id="t10"
                                            />
                                            <Label htmlFor="t10">10 min</Label>
                                        </div>
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem
                                                value="15"
                                                id="t15"
                                            />
                                            <Label htmlFor="t15">15 min</Label>
                                        </div>
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem
                                                value="30"
                                                id="t30"
                                            />
                                            <Label htmlFor="t30">30 min</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                {/* <FormDescription>
                                Choose the time control for the game.
                            </FormDescription> */}
                                {/* <FormMessage /> */}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="increment"
                        render={({ field }) => (
                            <FormItem className="flex-1/4 gap-0">
                                <FormLabel className="text-2xl font-mono">
                                    Increment
                                </FormLabel>
                                <FormControl>
                                    {/* <Input placeholder="enter time" {...field} /> */}
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-row justify-start items-center"
                                    >
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem value="0" id="i0" />
                                            <Label htmlFor="i0">0 sec</Label>
                                        </div>
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem value="2" id="i2" />
                                            <Label htmlFor="i2">2 sec</Label>
                                        </div>
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem value="5" id="i5" />
                                            <Label htmlFor="i5">5 sec</Label>
                                        </div>
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem
                                                value="i10"
                                                id="10"
                                            />
                                            <Label htmlFor="i10">10 sec</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="player_side"
                        render={({ field }) => (
                            <FormItem className="flex-1/4 gap-0">
                                <FormLabel className="text-2xl font-mono">
                                    Your Side
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-row justify-start items-center"
                                    >
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem
                                                value="white"
                                                id="white"
                                            />
                                            <Label htmlFor="white">White</Label>
                                        </div>
                                        <div className="flex items-center space-x-1 border-2 border-border rounded-full px-3 py-2">
                                            <RadioGroupItem
                                                value="black"
                                                id="black"
                                            />
                                            <Label htmlFor="black">Black</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-row justify-around items-center flex-1/4">
                        <Button
                            variant="outline"
                            size={"md"}
                            className="font-mono"
                            onClick={() => setView("default")}
                        >
                            Back
                        </Button>
                        <Button type="Submit" size={"md"}>
                            Submit
                        </Button>
                    </div>
                </form>
            </Form>
            <DialogBox 
                dialogOpen={dialogState}
                setDialogOpen={setDialogState}
                title="Your Game Code"
                desc="Share this code with your friend to play with them."
                content={
                    <div className="flex w-full items-center gap-2 mb-2">
                        <Input
                            readOnly
                            type="text"
                            defaultValue={gameState["gameId"]}
                            ref={gameIdRef}
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="submit"
                                    // size="md"
                                    className={"text-xl"}
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
                }
                onClose={() => setView("inGameOptions")}
            />
        </div>
    );
}

export { NewGameOptions };
