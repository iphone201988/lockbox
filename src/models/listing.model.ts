import mongoose, { Schema } from "mongoose";
import { IListing } from "../types/Database/types";

const listingSchema = new Schema<IListing>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        address: {
            type: String,
            default: null,
        },
        city: {
            type: String,
            default: null,
        },
        latitude: {
            type: Number,
            default: null,
        },
        longitude: {
            type: Number,
            default: null,
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",

            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },
        spaceType: {
            type: String,
            default: null,
        },
        features: {
            type: [String],
            default: [],
        },
        allowedStorage: {
            type: [String],
            default: [],
        },
        length: {
            type: Number,
            default: 0,
        },
        width: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            default: null,
        },
        tagline: {
            type: String,
            default: null,
        },
        storageImages: {
            type: [String],
            default: null,
        },
        description: {
            type: String,
            default: null,
        },
        policies: {
            type: String,
            default: null,
        },
        accessPolicy: {
            type: String,
            default: null,
        },
        frequency: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ['under_review', 'active', 'reject',],
            default: 'under_review',
        },
        totalReviews: {
            type: Number,
            default: 0,
            },
        averageRating: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);
listingSchema.index({ location: '2dsphere' });
const ListingModel = mongoose.model<IListing>('listing', listingSchema, 'listing');
export default ListingModel;