import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema({
    paymentIntentId: {
        type: String,
        unique: true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'booking',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    amount: {
        type: Number,
    },
    currency: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethodId: {
        type: String,
    },
    
},{timestamps:true});
const TransactionModel = mongoose.model('transaction', transactionSchema, "transaction");
export default TransactionModel;