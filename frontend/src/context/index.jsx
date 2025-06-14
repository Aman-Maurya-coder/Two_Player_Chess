import { useContext } from "react";

import { SocketContext, SocketProvider } from "./SocketContext";
import { PlayerContext, PlayerProvider } from "./PlayerContext";
import { GameContext, GameProvider } from "./GameContext";
import { GameOptionsContext, GameOptionsProvider } from "./GameOptionsContext";
import { TimerContext, TimerProvider } from "./TimerContext";

export function useSocketContext() {
    return useContext(SocketContext);
}

export function useGameContext() {
    return useContext(GameContext);
}

export function useGameOptionsContext() {
    return useContext(GameOptionsContext);
}

export function usePlayerContext() {
    return useContext(PlayerContext);
}

export function useTimerContext() {
    return useContext(TimerContext);
}

export function ContextProvider({ children }) {
    return (
        <SocketProvider>
            <PlayerProvider>
                <GameProvider>
                    <GameOptionsProvider>
                        <TimerProvider>
                            {children}
                        </TimerProvider>
                    </GameOptionsProvider>
                </GameProvider>
            </PlayerProvider>
        </SocketProvider>
    );
}