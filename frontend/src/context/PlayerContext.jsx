import { useContext, createContext, useState } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [playerId, setPlayerId] = useState(() => {
        const storedPlayerId = localStorage.getItem("playerId");
        return storedPlayerId ? JSON.parse(storedPlayerId) : null;
    });

    const [playerData, setPlayerData] = useState({});

    const resetPlayer = () => {
        // setPlayerId(null);
        setPlayerData({});
        localStorage.removeItem("playerId");
    }

    return (
        <PlayerContext.Provider value={{ playerId, setPlayerId, playerData, setPlayerData, resetPlayer }}>
            {children}
        </PlayerContext.Provider>
    );
}