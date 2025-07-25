import { useContext, createContext, useState } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [playerId, setPlayerId] = useState(() => {
        const storedPlayerId = localStorage.getItem("playerId");
        return storedPlayerId ? JSON.parse(storedPlayerId) : null;
    });

    const [playerData, setPlayerData] = useState({});

    const updatePlayerData = (newState) => {
        console.log("Updating player data:", newState);
        setPlayerData((prevState) => ({
            ...prevState,
            ...newState
        }))
    }

    const resetPlayerData = () => {
        // setPlayerId(null);
        setPlayerData({});
        // localStorage.removeItem("playerId");
    }

    return (
        <PlayerContext.Provider value={{ playerId, setPlayerId, playerData, updatePlayerData, resetPlayerData }}>
            {children}
        </PlayerContext.Provider>
    );
}