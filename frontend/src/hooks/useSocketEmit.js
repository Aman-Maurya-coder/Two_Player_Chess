export function useSocketEmit(socket, event, data){
    const emitEvent = (event, data) => {
        if(!socket) return;
        socket.emit(event, data);
    }
    return emitEvent;
}