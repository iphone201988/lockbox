// insurancePlan.ts (or whatever filename you prefer)

// Import mongoose
import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for TypeScript type checking
interface IInsurancePlan extends Document {
  name: string;
  price: number;
  coverage: number;
}

// Create the Mongoose schema
const InsurancePlanSchema: Schema = new Schema<IInsurancePlan>({
  name: {
    type: String,
    required: true,
    enum: ['Extended', 'Primary', 'Essential'], // Optional: restricts values to these options
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Ensures price isn't negative
  },
  coverage: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true, // Optional: adds createdAt and updatedAt fields
});

// Create and export the model
const InsurancePlanModel = mongoose.model<IInsurancePlan>('insurancePlan', InsurancePlanSchema, "insurancePlan");

export default InsurancePlanModel;
