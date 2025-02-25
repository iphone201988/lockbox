import { Schema, Document, model } from "mongoose";

interface IReview extends Document {
    _id: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    listingId: Schema.Types.ObjectId;
    hostId: Schema.Types.ObjectId;
    comment?: string;
    communication: number;
    accuracy: number;
    safety: number;
    cleanliness: number;
    rentAgain: boolean;
    averageRating: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        listingId: {
            type: Schema.Types.ObjectId,
            ref: "listing",
        },
        hostId: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        comment: {
            type: String,
            default: null,
        },
        communication: {
            type: Number,
            default: 0,
        },
        accuracy: {
            type: Number,
            default: 0,
        },
        safety: {
            type: Number,
            default: 0,
        },
        cleanliness: {
            type: Number,
            default: 0,
        },
        rentAgain: {
            type: Boolean,
            default: false,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const ReviewModel = model<IReview>("review", reviewSchema, "review");

export default ReviewModel;
export type { IReview };