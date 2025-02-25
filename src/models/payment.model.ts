import mongoose, { ObjectId } from "mongoose";
import { Schema } from "mongoose";

interface IPayment extends Document {
    bookingId: ObjectId;
    renterId: ObjectId;
    hostId: ObjectId;
    totalAmount: number;
    hostAmount: number;
    adminAmount: number;
    stripePaymentIntentId: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'booking' },
        renterId: { type: Schema.Types.ObjectId, ref: 'users' },
        hostId: { type: Schema.Types.ObjectId, ref: 'users', },
        totalAmount: { type: Number },
        hostAmount: { type: Number },
        adminAmount: { type: Number },
        stripePaymentIntentId: { type: String },
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    },
    { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
