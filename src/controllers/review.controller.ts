import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { UserModelType, } from "../types/Database/types";
import { SUCCESS } from "../utils/response";
import ReviewModel from "../models/review.model";
import ListingModel from "../models/listing.model";
import BookingModel from "../models/booking.model";
import mongoose from "mongoose";

//write a review and rating
export const writeReviewAndrating = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { listingId, hostId, comment, communication, accuracy, safety, cleanliness, rentAgain } = req.body;
        const userId = req.user._id;
        const listing = await ListingModel.findById(listingId);
        if (!listing) {
            throw new NotFoundError('Listing not found');
        }
        let review = await ReviewModel.findOne({
            userId,
            listingId,
            hostId,
        })
        if (!review) {
            review = new ReviewModel({
                userId,
                listingId,
                hostId,
            })
        }
        review.comment = comment ?? review.comment;
        review.communication = communication ?? review.communication;
        review.accuracy = accuracy ?? review.accuracy;
        review.cleanliness = cleanliness ?? review.cleanliness;
        review.safety = safety ?? review.safety;
        review.rentAgain = rentAgain ?? review.rentAgain;
        review.averageRating = ((review.communication + review.accuracy + review.cleanliness + review.safety) / 4);
        await review.save();
        const allReview = await ReviewModel.find({ listingId });
        if (allReview.length) {
            const averageRating = allReview.reduce((acc, review) => acc + review.averageRating || 0, 0) / allReview.length;
            listing.averageRating = averageRating;
            listing.totalReviews = allReview.length;
            await listing.save();
        }

        return SUCCESS(res, 200, "successfully", {});
    } catch (error) {
        next(error);
    }
}
// get my review
export const getMyReview = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.user._id;
        const reviews = await ReviewModel.find({ userId })
            .populate("hostId", "firstName lastName profileImage ");
        return SUCCESS(res, 200, "successfully", { reviews });
    } catch (error) {
        next(error);
    }
}
// get host all review
export const getHostAllReview = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const hostId = req.userId;
        const reviews = await ReviewModel.find({ hostId }).populate("userId", "firstName lastName profileImage ");
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((acc, review) => acc + review.averageRating || 0, 0) / totalReviews;
        //percentage would rent again rentAgain true false
        let percentagerentAgain = reviews.reduce((acc, review) => acc + Number(review.rentAgain), 0);
        percentagerentAgain = (percentagerentAgain / totalReviews) * 100;
        return SUCCESS(res, 200, "successfully", { reviews, averageRating, percentagerentAgain });

    } catch (error) {
        next(error)
    }
}
// get booking listing which i have not given review 
export const getBookingListingNoReview = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.userId;
        // console.log("userId",userId)
        const bookingsWithoutReviews = await BookingModel.aggregate([
            // Match bookings where the user is the renter
            {
                $match: {
                    renterId: userId,
                    status: "approve",
                    type: "current",
                }
            },
            // Lookup reviews for these bookings
            {
                $lookup: {
                    from: "review",
                    let: { listingId: "$listingId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$listingId", "$$listingId"] },
                                        { $eq: ["$userId", userId] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "reviews"
                }
            },
            // Filter for bookings with no reviews
            {
                $match: {
                    "reviews": { $size: 0 }
                }
            },
            // Lookup listing details
            {
                $lookup: {
                    from: "listing",
                    localField: "listingId",
                    foreignField: "_id",
                    as: "listingId"
                }
            },
            // Unwind the listing array
            {
                $unwind: "$listingId"
            },
            // Project the desired fields
            {
                $project: {
                    startDate: 1,
                    hostId: 1,
                    endDate: 1,
                    totalAmount: 1,
                    listingId: {
                        _id: 1,
                        address: 1,
                        city: 1,
                        spaceType: 1,
                        price: 1,
                        storageImages: 1
                    }
                }
            }
        ]);
        return SUCCESS(res, 200, "Success", { bookingsWithoutReviews })
    } catch (error) {
        console.error("Error fetching bookings without reviews:", error);
        next(error);
    }
}