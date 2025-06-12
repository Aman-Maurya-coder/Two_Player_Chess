import { useState } from "react";
import { useGameContext } from "../context/GameContext";

export function useGameState(){
    const { gameState, updateGameState } = useGameContext();
    return [gameState, updateGameState];
}