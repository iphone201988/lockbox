import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICheckIn extends Document {
    userId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
    agree: boolean;
    checkInDate: Date;
    images: string[];
    type: 'host' | 'rent' | null;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const checkInSchema = new Schema<ICheckIn>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'users' },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "booking",
        },
        agree: { type: Boolean, default: true },
        
        checkInDate: {
            type: Date,
            default: Date.now
        },
        images: [String],
        type: {
            type: String,
            enum: ['host', 'rent'],
            default: null,
        },
        note: {
            type: String,
            default: null,
        },

    },
    { timestamps: true }
);
const CheckInModel: Model<ICheckIn> = mongoose.model<ICheckIn>('checkIn', checkInSchema, 'checkIn');
export default CheckInModel;