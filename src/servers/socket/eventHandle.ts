// ------------------- Event Handlers -------------------

import { io, userSocketMap } from ".";
import MessageModel from "../../models/message.model";
import UserModel from "../../models/user.model";
import { SocketWithUser } from "../../types/Database/types";
import { JsonWebTokenError, TokenExpiredError } from "../../utils/errors";
import { createMessage, verifyToken } from "../../utils/utils";


/** Authenticate socket connection */
export const authenticateSocket = async (socket: SocketWithUser, next: (err?: any) => void) => {
    try {
        const authHeader = socket?.handshake?.headers?.authorization;
        if (!authHeader) throw new JsonWebTokenError("No token provided");

        const token = authHeader.split(" ")[1];
        if (!token) throw new JsonWebTokenError("Authentication failed. Missing token.");

        const decoded: any = await verifyToken(token);
        if (!decoded) throw new TokenExpiredError("Invalid or expired token");

        // Fetch user details
        const user = await UserModel.findById(decoded.id);

        if (!user) throw new JsonWebTokenError("User not found");

        user.isActive = true;
        await user.save();

        socket.userId = decoded.id;
        socket.user = user;
        socket.role = user.role;

        // console.log("Authenticated user:", user);
        next();
    } catch (error: any) {
        console.error("Socket authentication failed:", error.message);
        next(error);
    }
};



/** Handle user disconnection */
export const handleDisconnection = async (socket: SocketWithUser) => {
    try {
        console.log(`User disconnected: ${socket.userId}`);
        userSocketMap.delete(socket.userId);
        const user = await UserModel.findByIdAndUpdate(socket.userId, { isActive: false });
    } catch (error: any) {
        console.error("Error handling disconnection:", error.message);
    }
};

interface JoinRoomData {
    conversationId: string;
  }

interface ReadMessageType {
    conversationId: string; messageId: string
  }
interface SendMessageType {
    conversationId: string; content: string; receiver: string; contentType:  'text' | 'video' | 'audio' | 'image'
  }
/** Handle joining a room */
export const handleJoinRoom = (socket: SocketWithUser, data:string) => {
    try {
        const parseData: JoinRoomData = JSON.parse(data);
        console.log("Received data:", parseData);
        const {conversationId} = parseData
        console.log("roomId",conversationId)
        // Check if userId or roomId is missing
        if (!socket.userId || !conversationId) {
            const errorMessage = `User ID or room ID is missing.`;
            socket.emit("error", errorMessage);
            console.error(errorMessage);
            return;
        }

        // Join the room
        socket.join(conversationId);
        
        // Emit the room ID to the user who joined
        socket.emit("room_id", conversationId);
        console.log(`User ${socket.userId} joined room: ${conversationId}`);

    } catch (error:any) {
        console.error("Error handling room join:", error.message);
        socket.emit("error", "Invalid data or server error.");
    }
};

/** Handle leaving a room */
export const handleLeaveRoom = (socket: SocketWithUser,  data: string) => {
    try {
        const parseData: JoinRoomData = JSON.parse(data);
        console.log("Received data:", parseData);
        const {conversationId} = parseData
    if (!socket.userId || !conversationId) {
        console.error("User ID or room ID is missing");
        socket.emit("error", "Invalid user ID or room ID");
        return;
    }
    socket.leave(conversationId);
    console.log(`User ${socket.userId} left room: ${conversationId}`);
    } catch (error: any) {
        console.error("Error handling room leave:", error.message);
        socket.emit("error", "Invalid user ID or room ID");
    }
};

/** Handle typing event */
export const handleTyping = (socket: SocketWithUser,  data: string) => {
    try {
        const parseData: JoinRoomData = JSON.parse(data);
        console.log("Received data:", parseData);
        const {conversationId} = parseData
    socket.to(conversationId).emit("typing", socket.userId);
    } catch (error: any) {
        console.error("Error handling typing event:", error.message);
        socket.emit("error", "Invalid data");
        }
};

/** Handle stop typing event */
export const handleStopTyping = (socket: SocketWithUser,  data: string) => {
    try {
        const parseData: JoinRoomData = JSON.parse(data);
        console.log("Received data:", parseData);
        const {conversationId} = parseData
    socket.to(conversationId).emit("stop_typing", socket.userId);
} catch (error: any) {
    console.error("Error handling typing event:", error.message);
    socket.emit("error", "Invalid data");
    }
};

/** Handle message read event */
export const handleReadMessage = async (socket: SocketWithUser,data:string ) => {
    try {
        const parseData: ReadMessageType = JSON.parse(data);
        console.log("Received data:", parseData);
        const {conversationId, messageId} = parseData
        await MessageModel.findByIdAndUpdate(messageId, { status: 3 });
        const message = await MessageModel.findById(messageId);
        io.to(conversationId).emit("read_message", {message});
    } catch (error: any) {
        console.error("Error marking message as read:", error.message);
        socket.emit("error", error.message );
    }
};

/** Handle message delivered event */
export const handleDeliveredMessage = async (socket: SocketWithUser,data:string) => {
    try {
        const parseData: ReadMessageType = JSON.parse(data);
        console.log("Received data:", parseData);
        const {conversationId, messageId} = parseData
        await MessageModel.findByIdAndUpdate(messageId, { status: 2 });
        const message = await MessageModel.findById(messageId);
        io.to(conversationId).emit("delivered_message", message);
    } catch (error: any) {
        console.error("Error marking message as delivered:", error.message);
        socket.emit("error", error.message );
    }
};

/** Handle sending a message */
export const handleSendMessage = async (
    socket: SocketWithUser,
    data: string,
) => {
    try {
        const parseData: SendMessageType = JSON.parse(data);
        console.log("Received data:", parseData);
        const {conversationId, content, receiver, contentType} = parseData;
        const message = await createMessage({ user1: socket.userId, user2:receiver,content, contentType, conversationId});
        // io.to(conversationId).emit("receive_message", { conversationId, message });
        const messagePayload = { conversationId, message };
        socket.emit("receive_message", messagePayload);
        const receiverSocketId = userSocketMap.get(receiver);
        if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", messagePayload);
        } else {
        console.log(`Receiver ${receiver} is not currently connected`);
        }
        console.log(`Message sent in room ${conversationId}:`, content);
    } catch (error: any) {
        socket.emit("error", error.message );
        console.error("Error sending message:", error.message);
    }
};
