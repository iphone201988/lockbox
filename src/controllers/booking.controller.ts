import { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { IListing } from "../types/Database/types";
import { SUCCESS } from "../utils/response";
import mongoose from "mongoose";
import BookingModel from "../models/booking.model";
import ConversationModel from "../models/conversation.model";
import { createMessage, stripe } from "../utils/utils";
import CheckInModel from "../models/cleckIn.model";
import DisputeModel from "../models/dispute.model";
import InsurancePlanModel from "../models/insurance.model";
import TransactionModel from "../models/transaction.model";

//request booking

export const requestBooking = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.userId;
        const userExists = req.user!;
        let { listingId, startDate, endDate, hostId, content, paymentMethodId, currency, insuranceId, amount, totalAmount, tax, serviceFee } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Convert to cents
            currency,
            customer: userExists.stripeCustomerId,
            description: `Payment from ${userExists.email} `,
            payment_method: paymentMethodId,
            confirm: true, // Immediately confirm the payment
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never' // Prevents redirect flows
            }
        });
        if (paymentIntent.status !== "succeeded") {
            throw new Error('Payment failed');
        }
        const booking = new BookingModel({
            renterId: userId, hostId, listingId, startDate, endDate, insuranceId, amount, totalAmount, tax, serviceFee
        });
        await booking.save();
        const transaction = new TransactionModel({
            paymentIntentId: paymentIntent.id,
            bookingId: booking._id,
            userId,
            amount: totalAmount,
            currency,
            status: paymentIntent.status,
            paymentMethodId
        });
        await transaction.save();
        await createMessage({ user1: userId, user2: hostId, content: content || "hello world", bookingId: booking._id })
        return SUCCESS(res, 201, "Booking created successfully", {});
    } catch (error) {
        next(error);
    }
};
// get all bookings also paginations
export const checkBooking = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { listingId, startDate, endDate } = req.query as {
            listingId: string;
            startDate: string;
            endDate: string;
        };
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format provided');
        }

        if (start >= end) {
            throw new Error('Start date must be before end date');
        }
        const existingBookings = await BookingModel.find({
            listingId,
            $or: [
                {
                    startDate: { $lte: end },
                    endDate: { $gte: start }
                },
                {
                    startDate: { $gte: start },
                    endDate: { $lte: end }
                }
            ]
        }).lean(); 

        const isBooked = existingBookings.length > 0;

        return SUCCESS(res, 200, "Availability checked successfully", { 
            isBookingExist: isBooked,
            available: !isBooked,
            checkedDates: { startDate, endDate }
        });
    } catch (error) {
        next(error);
    }
};
// get all bookings also paginations
export const getAllBookingOfRenter = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10, type } = req.query;

        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const skip = (pageNumber - 1) * pageSize;

        let match: any = { renterId: userId };
        if (type === 'future') {
            match["type"] = 'future';
        } else if (type === 'current') {
            match["type"] = 'current';
        } else if (type === 'past') {
            match["type"] = 'past';
        } else if (type === 'dispute') {
            match["type"] = 'dispute'
        }

        const bookings = await BookingModel.aggregate([
            {
                $match: match
            },
            {
                $lookup: {
                    from: "listing",
                    localField: "listingId",
                    foreignField: "_id",
                    as: "listingId"
                }
            },
            { $unwind: { path: "$listingId", preserveNullAndEmptyArrays: true } },
            { $skip: skip },
            { $limit: pageSize },
        ]);
        const totalCount = await BookingModel.countDocuments(match);
        const pagination: any = {
            total: totalCount,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        };

        return SUCCESS(res, 200, "Listings retrieved successfully", { bookings, pagination, type });
    } catch (error) {
        next(error);
    }
};

//
export const getAllBookingOfHost = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10, type } = req.query;

        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const skip = (pageNumber - 1) * pageSize;

        let match: any = { hostId: userId };
        if (type === 'future') {
            match["type"] = 'future';
        } else if (type === 'current') {
            match["type"] = 'current';
        } else if (type === 'past') {
            match["type"] = 'past';
        } else if (type === 'dispute') {
            match["type"] = 'dispute'
        }


        const bookings = await BookingModel.aggregate([
            {
                $match: match
            },
            {
                $lookup: {
                    from: "listing",
                    localField: "listingId",
                    foreignField: "_id",
                    as: "listingId"
                }
            },
            { $unwind: { path: "$listingId", preserveNullAndEmptyArrays: true } },
            { $skip: skip },
            { $limit: pageSize },
        ]);
        const totalCount = await BookingModel.countDocuments(match);
        const pagination: any = {
            total: totalCount,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        };

        return SUCCESS(res, 200, "Listings retrieved successfully", { bookings, pagination, type });
    } catch (error) {
        next(error);
    }
};

export const disputeStorage = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { desc, bookingId } = req.body;
        const { _id, dashboardRole } = req.user;

        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            throw new NotFoundError(`Booking not found`);
        }
        const dispute = new DisputeModel({
            desc,
            bookingId,
            userId: _id,
            type: dashboardRole,

        })
        if (req.files && Array.isArray(req.files)) {
            dispute.images = req.files.map((file: any) => `/uploads/${file.filename}`);
        }
        await dispute.save();

        return SUCCESS(res, 200, "successfully", { dispute });
    } catch (error) {
        next(error);
    }
};
export const bookingStatusUpdate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            throw new NotFoundError(`Booking not found`);
        }
        booking.status = status;
        await booking.save();

        return SUCCESS(res, 200, "successfully", { booking });
    } catch (error) {
        next(error);
    }
};


/// cleckIn
export const cleckInBooking = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const user = req.user;
        const { bookingId, agree, checkInDate, note } = req.body;

        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            throw new NotFoundError(`Booking not found`);
        }
        let checkIn = new CheckInModel({
            userId: user._id,
            type: user.dashboardRole,
            bookingId,
            agree,
            checkInDate,
            note
        });
        if (req.files && Array.isArray(req.files)) {
            checkIn.images = req.files.map((file: any) => `/uploads/${file.filename}`);
        }
        await checkIn.save();

        return SUCCESS(res, 200, "successfully", { data: checkIn });
    } catch (error) {
        next(error);
    }
};
// get Insurance Plan
export const getInsurancePlan = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const imsurancePlans = await InsurancePlanModel.find({});
        return SUCCESS(res, 200, "successfully", { imsurancePlans });
    } catch (error) {
        next(error);
    }

}