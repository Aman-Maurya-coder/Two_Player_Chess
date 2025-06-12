import { useEffect } from "react";

export function useSocketEvent(socket, event, callback) {
    useEffect(() => {
        if (!socket) return;

        // Register the event handler
        socket.on(event, callback);

        // Cleanup function to remove the event listener
        return () => {
            socket.off(event, callback);
        };
    }, [socket, event, callback]);
}