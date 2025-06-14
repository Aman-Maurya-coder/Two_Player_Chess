export function useSocketEmit(socket){
    const emitEvent = (event, data={}) => {
        if (socket && socket.connected) {
            socket.emit(event, data);
        } else {
            console.error("Socket is not connected. Cannot emit event:", event);
        }
    }
    return emitEvent;
}