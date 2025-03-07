import mongoose, { ObjectId, Schema } from "mongoose";
import { UserModelType } from "../types/Database/types";

interface IMessage extends Document {
    conversation: ObjectId;
    sender: ObjectId | UserModelType;
    content: string;
    contentType: 'text' | 'video' | 'audio' | 'image';
    status: "sent" | "read";
    bookingId: ObjectId | null; // Linked to the property being rented
    bookingStatus: "pending" | "approved" | "rejected" | null; // Booking status
    createdAt?: Date,
    updatedAt?: Date
}

const messageSchema = new Schema<IMessage>(
    {
        conversation: { type: Schema.Types.ObjectId, ref: "conversation" },
        sender: { type: Schema.Types.ObjectId, ref: "users" },
        content: { type: String, },
        contentType: { type: String,enum:['text','video','audio','image'],default:'text' },
        status: { type: String, enum: ["sent", "read"], default: "sent" },
        bookingId: { type: Schema.Types.ObjectId, ref: "booking", default: null },
        bookingStatus: { type: String, enum: ["pending", "approved", "rejected"], default: null },
    },
    { timestamps: true }
);

const MessageModel = mongoose.model<IMessage>("message", messageSchema, "message");
export default MessageModel;
