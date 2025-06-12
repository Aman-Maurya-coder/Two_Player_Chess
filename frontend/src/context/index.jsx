import { GameProvider } from "./GameContext";
import { GameOptionsProvider } from "./GameOptionsContext";
import { TimerProvider } from "./TimerContext";

export function ContextProvider({ children }) {
    return (
        <GameProvider>
            <GameOptionsProvider>
                <TimerProvider>
                    {children}
                </TimerProvider>
            </GameOptionsProvider>
        </GameProvider>
    );
}