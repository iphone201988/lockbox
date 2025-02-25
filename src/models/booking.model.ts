import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
    renterId: mongoose.Types.ObjectId;
    hostId: mongoose.Types.ObjectId;
    listingId: mongoose.Types.ObjectId;
    amount: number;
    serviceFee: number;
    tax: number;
    totalAmount: number;
    startDate: Date;
    endDate: Date;
    type: 'future' | 'current' | 'past' | 'dispute';
    status: 'under_review' | 'approve' | 'reject' | 'dispute';
    isBookingConfirmed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
    {
        renterId: { type: Schema.Types.ObjectId, ref: 'users' },
        hostId: { type: Schema.Types.ObjectId, ref: 'users' },
        listingId: {
            type: Schema.Types.ObjectId,
            ref: "listing",
        },
        amount: { type: Number, default: 0 },
        serviceFee: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        type: {
            type: String,
            enum: ['future', 'current', 'past', 'dispute'],
            default: 'future',
        },
        status: {
            type: String,
            enum: ['under_review', 'approve', 'reject', 'dispute',],
            default: 'under_review',
        },
        isBookingConfirmed: {
            type: Boolean,
            default: false,
        },

    },
    { timestamps: true }
);
const BookingModel: Model<IBooking> = mongoose.model<IBooking>('booking', bookingSchema, 'booking');
export default BookingModel;