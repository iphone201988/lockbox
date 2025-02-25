import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDispute extends Document {
    userId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
    type: 'host' | 'rent' | null;
    images: string[];
    desc: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'users' },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "booking",
        },
        type: {
            type: String,
            enum: ['host', 'rent'],
            default: null,
        },
        images: [String],
        desc: {
            type: String,
            default: null,
        },

    },
    { timestamps: true }
);
const DisputeModel: Model<IDispute> = mongoose.model<IDispute>('dispute', disputeSchema, 'dispute');
export default DisputeModel;