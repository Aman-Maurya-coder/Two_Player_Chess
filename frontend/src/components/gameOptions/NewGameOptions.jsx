import React, { useState } from "react";
import { useGameOptionsContext, useSocketContext } from "../../context/index.jsx";
import { useForm } from "react-hook-form";
import { useSocketEmit } from "../../hooks/useSocketEmit.js";
import { useSocketEvent } from "../../hooks/useSocketEvent.js";
import { usePlayerContext } from "../../context/index.jsx";

function NewGameOptions({ socket, setView }) {
    // const {socket} = useSocketContext();
    // console.log(socket);
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const { playerId } = usePlayerContext();
    const { updateGameOptions } = useGameOptionsContext();
    // Ensure playerId is available before proceeding
    if (!playerId) {
        console.error("Player ID is not set. Cannot create a new game.");
        setView("default");
        return null; // or handle the error as needed
    }
    const emitEvent = useSocketEmit(socket);

    useSocketEvent(socket, "gameRoomCreated",(gameId) => {
        console.log("player joined the new game room :", gameId);
        // console.log("changed the view to ingameoptions");
        setView("inGameOptions");
    })

    const onSubmit = (data) => {
        console.log("data :", data);
        emitEvent("newGame", {
            "playerId": playerId,
            "playerSide": data["Player Side"],
            "timeControl": {
                "time": data["Time Control"],
                "increment": data["Increment"]
            }
        })
        console.log("newGame event emmitted");
        updateGameOptions({
            "time": data["Time Control"],
            "increment": data["Increment"],
            "playerSide": data["Player Side"]
        });
    }
    return (
        // <div>
        //     <h2>Time Control</h2>
        //     <div>
        //         <button>3</button>
        //         <button>5</button>
        //         <button>10</button>
        //         <button>15</button>
        //         <button>30</button>
        //         <button>custom</button>
        //     </div>
        // </div>
        <form onSubmit={handleSubmit(onSubmit)} className="newGameForm">
            <div>
                <h3>Timer Control</h3>
                <p>5min</p>
                <input
                    {...register("Time Control", { required: true })}
                    type="radio"
                    value="5"
                />
                <p>10min</p>
                <input
                    {...register("Time Control", { required: true })}
                    type="radio"
                    value="10"
                />
                <p>15min</p>
                <input
                    {...register("Time Control", { required: true })}
                    type="radio"
                    value="15"
                />
                <p>30min</p>
                <input
                    {...register("Time Control", { required: true })}
                    type="radio"
                    value="30"
                />
                <p>custom</p>
                <input
                    {...register("Time Control", { required: true })}
                    type="radio"
                    value="custom"
                />
            </div>
            <div>
                <h3>Increment</h3>
                <p>0 sec</p>
                <input {...register("Increment")} type="radio" value="0" />
                <p>2 sec</p>
                <input {...register("Increment")} type="radio" value="2" />
                <p>5 sec</p>
                <input {...register("Increment")} type="radio" value="5" />
                <p>10 sec</p>
                <input {...register("Increment")} type="radio" value="10" />
            </div>
            <div>
                <h3>Choose Side</h3>
                <p>White</p>
                <input {...register("Player Side")} type="radio" value="White" />
                <p>Black</p>
                <input {...register("Player Side")} type="radio" value="Black" />
            </div>

            <input type="submit" />
        </form>
    );
}

export {NewGameOptions};
