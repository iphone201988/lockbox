import mongoose, { Schema, Document, Model } from "mongoose";
import { IListing } from "../types/Database/types";

export interface IBooking extends Document {
    renterId: mongoose.Types.ObjectId;
    hostId: mongoose.Types.ObjectId;
    listingId: mongoose.Types.ObjectId | IListing;
    insuranceId: mongoose.Types.ObjectId;
    amount: number;
    serviceFee: number;
    tax: number;
    totalAmount: number;
    startDate: Date;
    endDate: Date;
    totalMonth: number;
    totalPaidMonthHost: number;
    totalPaidMonthRent: number;
    paymentMethodId: string | null;
    currency: string;
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
        insuranceId: {
            type: Schema.Types.ObjectId,
            ref: "insurancePlan",
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
        totalMonth :{
            type: Number,
            default: 1
        },
        totalPaidMonthHost:{
            type:Number,
            default:0
        }, 
        totalPaidMonthRent:{
            type:Number,
            default:0
        }, 
        paymentMethodId: {
            type: String,
            default: null,
        },
        currency:{
            type:String,
            default: 'cad',
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