import { useContext, createContext, useState } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [playerId, setPlayerId] = useState(() => {
        const storedPlayerId = localStorage.getItem("playerId");
        return storedPlayerId ? JSON.parse(storedPlayerId) : null;
    });

    const [playerData, setPlayerData] = useState({});

    return (
        <PlayerContext.Provider value={{ playerId, setPlayerId, playerData, setPlayerData }}>
            {children}
        </PlayerContext.Provider>
    );
}