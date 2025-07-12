import { useEffect } from "react";

export function useSocketEvent(socket, event, callback) {
    useEffect(() => {
        // console.log(socket);
        if (!socket) {
            console.warn("Socket is not initialized. Event listener not registered.");
            return;
        }

        // Register the event handler
        socket.on(event, callback);

        // Cleanup function to remove the event listener
        return () => {
            socket.off(event, callback);
        };
    }, [socket, event, callback]);
}