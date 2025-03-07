// src/socket.ts
import { Server, } from "socket.io";
import { SocketWithUser } from "../../types/Database/types";
import { authenticateSocket, handleDeliveredMessage, handleDisconnection, handleJoinRoom, handleLeaveRoom, handleReadMessage, handleSendMessage, handleStopTyping, handleTyping } from "./eventHandle";

export let io: Server;
export const userSocketMap = new Map<string, string>();
// Initialize the Socket.IO server
export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins
      methods: ["GET", "POST", "DELETE", "PUT"],
    },
  });

  // Middleware to authenticate and attach user to socket
  io.use(authenticateSocket);

  io.on("connection", (socket: SocketWithUser) => {
    console.log(`User connected: ${socket.userId}`);
    userSocketMap.delete(socket.userId);
    userSocketMap.set(socket.userId, socket.id);

    // Register event handlers
  socket.on("join_room", (data) => handleJoinRoom(socket, data));
  socket.on("leave_room", (data) => handleLeaveRoom(socket, data));
  socket.on("typing", (data) => handleTyping(socket, data));
  socket.on("stop_typing", (data) => handleStopTyping(socket, data));
  socket.on("read_message", (data) => handleReadMessage(socket, data));
  socket.on("delivered_message", (data) => handleDeliveredMessage(socket, data));
  socket.on("send_message", (data) => handleSendMessage(socket, data));

    // Handle disconnection
    socket.on("disconnect", () => handleDisconnection(socket));
  });
};


