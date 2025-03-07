import { Schema, Document, model } from "mongoose";

interface INotification extends Document {
    _id: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    bookingId: Schema.Types.ObjectId;
    listingId: Schema.Types.ObjectId;
    renterId: Schema.Types.ObjectId;
    hostId: Schema.Types.ObjectId;
    userRole: string;
    title: string;
    body: string;
    type: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        listingId: {
            type: Schema.Types.ObjectId,
            ref: "listing",
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "booking",
        },
        hostId: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        renterId: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        title: {
            type: String,
            default: null,
        },
        body: {
            type: String,
            default: null,
        },
        userRole:{
            type: String,
            enum: ["host", "rent"],
        },
        type:{
            type:Number,
        }
        
    },
    { timestamps: true }
);

const NotificationModel = model<INotification>("notification", notificationSchema, "notification");

export default NotificationModel;
