import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface IConversation extends Document {
    participants: ObjectId[]; // Host and Renter
    lastMessage: string,
    bookingId: ObjectId | null; // Linked to the property being rented
}
const conversationSchema = new Schema<IConversation>(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: "users", required: true }],
        lastMessage: {
            type: String,
            default: null
        },
        bookingId: { type: Schema.Types.ObjectId, ref: "booking", },
    },
    { timestamps: true }
);

const ConversationModel = mongoose.model<IConversation>("conversation", conversationSchema, "conversation");
export default ConversationModel;

