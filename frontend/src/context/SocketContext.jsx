// import { io } from "socket.io-client";
// import { createContext, useEffect, useState } from "react";

// export const SocketContext = createContext();

// // const url = "https://nrjrsvh4-3000.inc1.devtunnels.ms/" || "http://localhost:3000";
// const url = "http://localhost:3000"; // Update this to your server URL

// export function SocketProvider({ children }){
//     const [socket, setSocket] = useState(null);

//     useEffect(() => {
//         if (!socket) {
//             const socketInstance = io(url);
//             // console.log(socketInstance);
//             setSocket(socketInstance);
//             socketInstance.on("connect", () => {
//                 console.log("Socket connected:", socketInstance.id);
//             });
//             socketInstance.on("connect_error", (error) => {
//                 console.error("Socket connection error:", error);
//             });
            
//             socketInstance.on("disconnect", (reason) => {
//                 console.log("Socket disconnected:", reason);
//             });
//             return () => {
//                 if (socketInstance) {
//                 socketInstance.disconnect();
//                 }
//                 // console.log("Socket disconnected");
//             };
//         }
//     }, []);
//     // console.log(socket);
//     return (
//         <SocketContext.Provider value={{socket}}>
//             {children}
//         </SocketContext.Provider>
//     )
// }