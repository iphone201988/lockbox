import { NextFunction, Request, Response } from "express";
import ListingModel from "../models/listing.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { IListing } from "../types/Database/types";
import { SUCCESS } from "../utils/response";
import mongoose from "mongoose";

//create listing 

export const createListing = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.userId;
        let { address, city, latitude, longitude, spaceType,
            features, allowedStorage, length, width, price, tagline,
            description, policies, accessPolicy, frequency, verified
        } = req.body;
        //parse json string
        if (typeof features === "string") {
            try {
                features = JSON.parse(features);
            } catch (error) {
                console.error("Error parsing tags:", error);
                throw new BadRequestError("Invalid tags format");
            }
        }
        if (typeof allowedStorage === "string") {
            try {
                allowedStorage = JSON.parse(allowedStorage);
            } catch (error) {
                console.error("Error parsing tags:", error);
                throw new BadRequestError("Invalid tags format");
            }
        }
        const listing = new ListingModel(
            {
                userId,
                address, city, latitude, longitude, spaceType, features,
                allowedStorage, length, width, price, tagline, description,
                policies, accessPolicy, frequency, verified
            });
        if (latitude && longitude) {
            listing.location = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
        }
        if (req.files && Array.isArray(req.files)) {
            listing.storageImages = req.files.map((file: any) => `/uploads/${file.filename}`);
        }
        await listing.save();
        return SUCCESS(res, 201, "Listing created successfully", { listing });
    } catch (error) {
        next(error);
    }
};
// get all listings also paginations
export const getAllListings = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const skip = (pageNumber - 1) * pageSize;

        let match: any = { userId: userId };
        const listings = await ListingModel.aggregate([
            {
                $match: match
            },
            { $skip: skip },
            { $limit: pageSize },
        ]);
        const totalCount = await ListingModel.countDocuments(match);
        const pagination: any = {
            total: totalCount,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        };

        return SUCCESS(res, 200, "Listings retrieved successfully", { listings, pagination });
    } catch (error) {
        next(error);
    }
};


// find all with near location  or length and width or price  or fectures or allowedStorage or sorting by price
type SortOption =
    | 'large_size'
    | 'small_size'
    | 'high_price'
    | 'low_price'
    | 'latest';
interface QueryParams {
    latitude?: string;
    longitude?: string;
    length?: string;
    width?: string;
    price?: string;
    features?: string | string[];
    allowedStorage?: string | string[];
    sort?: SortOption;  // Use specific type instead of string
    page?: string;
    limit?: string;
}
export const findListings = async (req: Request<{}, {}, {}, QueryParams>, res: Response, next: NextFunction): Promise<any> => {
    try {
        let {
            latitude,
            longitude,
            length,
            width,
            price, // Number
            features, // Array of Strings
            allowedStorage, // Array of Strings
            sort = "large_size", // small_size, high_price, low_price (large_size  mean large to small and smallsize mean smal to large)
            page = "1", // Default Page = 1
            limit = "10" // Default Limit = 10
        } = req.query;

        const userId = req.userId;
        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const skip = (pageNumber - 1) * pageSize;

        let pipeline: any[] = [];

        //  Use `$geoNear` as the first stage if location is provided
        if (latitude && longitude) {
            pipeline.push({
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)]
                    },
                    distanceField: "distance",
                    maxDistance: 20000, // 20km radius
                    spherical: true
                }
            });
        }

        let matchStage: any = {
            userId: { $ne: userId }, // Uncomment if needed
            status: "active"
        };

        if (length) matchStage.length = { $gte: Number(length) };
        if (width) matchStage.width = { $gte: Number(width) };
        if (price) matchStage.price = { $lte: Number(price) };

        // Features Filtering
        if (features) {
            if (!Array.isArray(features) && typeof features == "string") {
                features = features.split(",");
            }
            matchStage.features = { $in: features };
        }

        // Allowed Storage Filtering
        if (allowedStorage) {
            if (!Array.isArray(allowedStorage) && typeof allowedStorage == "string") {
                allowedStorage = allowedStorage.split(",");
            }
            matchStage.allowedStorage = { $in: allowedStorage };
        }

        // Add `$match` stage only if filters exist
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Sorting Logic
        const sortOptions: Record<SortOption, any> = {
            'large_size': { length: -1, width: -1 },
            'small_size': { length: 1, width: 1 },
            'high_price': { price: -1 },
            'low_price': { price: 1 },
            'latest': { createdAt: -1 },
        };

        // Use the sort value with fallback
        const sortStage = sortOptions[sort] || sortOptions['latest'];
        pipeline.push({ $sort: sortStage });

        pipeline.push({
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: pageSize },
                    {
                        $project: {
                            name: 1,
                            price: 1,
                            length: 1,
                            width: 1,
                            features: 1,
                            allowedStorage: 1,
                            location: 1,
                            createdAt: 1,
                            userId: 1,
                            storageImages: 1,
                            tagline: 1,
                            policies: 1,
                            accessPolicy: 1,
                            spaceType: 1,
                            frequency: 1,
                            description: 1,
                            totalReviews: 1,
                            averageRating: 1,
                            distance: 1 // Include distance if `$geoNear` is used
                        }
                    }
                ],
                totalCount: [{ $count: "count" }] // Get Total Document Count
            }
        });

        // 🔹 Execute Aggregation
        const result = await ListingModel.aggregate(pipeline);
        const listings = result[0].data;
        const totalCount = result[0].totalCount[0]?.count || 0;

        const pagination: any = {
            total: totalCount,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        };

        return SUCCESS(res, 200, "Listings retrieved successfully", { listings, pagination });
    } catch (error) {
        next(error);
    }
};
// get by id
export const getListingById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const id = req.params.id;
        const userId = req.userId.toString();
        //user aggregates
        const pipeline = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                },
            }, {
                $lookup: {
                    from: 'booking', // Assuming your booking collection is named 'bookings'
                    let: { listingId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$listingId', '$$listingId'] },
                                        { $eq: ['$renterId', new mongoose.Types.ObjectId(userId)] },
                                        {
                                            $in: ['$status', ['approve', 'under_review', 'dispute']]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'userBookings'
                }
            },
            {
                $addFields: {
                    isBooked: { $gt: [{ $size: '$userBookings' }, 0] },
                }
            },
            {
                $lookup: {
                    from: 'booking', // Assuming your booking collection is named 'bookings'
                    let: { listingId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$listingId', '$$listingId'] },
                                        {
                                            $in: ['$status', ['approve']]
                                        }, {
                                            $eq: ['$type', 'current']
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'bookingId'
                }
            },
            { $unwind: { path: "$bookingId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',        
                    localField: 'userId',    
                    foreignField: '_id',
                    as: 'userId',
                    pipeline:[
                        {
                            $project:{
                                _id:1, firstName:1, lastName:1, email:1, phone:1, profileImage:1,
                            }
                        }
                    ]
                },
            },
            {
                $lookup: {
                    from: 'review', 
                    let: { listingId: new mongoose.Types.ObjectId(id) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$listingId', '$$listingId'] },
                                    ]
                                }
                            }
                        }, {
                            $lookup: {
                                from: 'users',        
                                localField: 'userId',    
                                foreignField: '_id',
                                as: 'userId',
                                pipeline:[
                                    {
                                        $project:{
                                            _id:1, firstName:1, lastName:1, email:1, phone:1, profileImage:1,
                                        }
                                    }
                                ]
                            },
                        },
                    ],
                    as: 'reviews'
                }
            },
            {
                $project: {
                    userBookings: 0 // Optionally remove the temporary userBookings array from the output
                }
            }
        ];
        const result = await ListingModel.aggregate(pipeline);
        const listing = result[0];
        return SUCCESS(res, 200, "Listing retrieved successfully", { listing });
    } catch (error) {
        next(error);
    }
}
//update listing 
export const updateListing = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const id = req.params.id;
        let {
            address, city, latitude, longitude, spaceType,
            features, allowedStorage, length, width, price, tagline,
            description, policies, accessPolicy, frequency, images
        } = req.body;

        let listing = await ListingModel.findById(id);
        if (!listing) {
            throw new NotFoundError("Listing not found");
        }

        if (typeof features === "string") {
            try {
                features = JSON.parse(features);
            } catch (error) {
                console.error("Error parsing features:", error);
                throw new BadRequestError("Invalid features format");
            }
        }
        if (typeof images === "string") {
            try {
                images = JSON.parse(images);
                console.log("images", images)
            } catch (error) {
                console.error("Error parsing images:", error);
                throw new BadRequestError("Invalid images format");
            }
        }

        if (typeof allowedStorage === "string") {
            try {
                allowedStorage = JSON.parse(allowedStorage);
            } catch (error) {
                console.error("Error parsing allowedStorage:", error);
                throw new BadRequestError("Invalid allowedStorage format");
            }
        }

        if (latitude && longitude) {
            listing.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            };
        }
        if (address) listing.address = address;
        if (city) listing.city = city;
        if (spaceType) listing.spaceType = spaceType;
        if (length) listing.length = length;
        if (width) listing.width = width;
        if (price) listing.price = price;
        if (tagline) listing.tagline = tagline;
        if (description) listing.description = description;
        if (policies) listing.policies = policies;
        if (accessPolicy) listing.accessPolicy = accessPolicy;
        if (frequency) listing.frequency = frequency;
        if (features) listing.features = features;
        if (allowedStorage) listing.allowedStorage = allowedStorage;
        if (images) listing.storageImages = images;


        if (req.files && Array.isArray(req.files)) {
            if (req.files && Array.isArray(req.files)) {
                const uploadedImages = req.files.map((file: any) => `/uploads/${file.filename}`);
                listing.storageImages.push(...uploadedImages); // Push the new images into existing ones
            }

        }
        await listing.save();

        return SUCCESS(res, 200, "Listing updated successfully", { listing });
    } catch (error) {
        next(error);
    }
};
