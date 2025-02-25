import { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { IListing } from "../types/Database/types";
import { SUCCESS } from "../utils/response";
import mongoose from "mongoose";
import BookingModel from "../models/booking.model";
import ConversationModel from "../models/conversation.model";
import { createMessage } from "../utils/utils";
import CheckInModel from "../models/cleckIn.model";
import DisputeModel from "../models/dispute.model";

//request booking

export const requestBooking = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.userId;
        let { listingId, startDate, endDate, hostId, content } = req.body;

        const booking = new BookingModel({
            renterId: userId, hostId, listingId, startDate, endDate,
        });
        await booking.save();
        await createMessage({ user1: userId, user2: hostId, content: content || "hello world", bookingId: booking._id })
        return SUCCESS(res, 201, "Booking created successfully", { booking });
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
            match[type] = 'future';
        } else if (type === 'current') {
            match[type] = 'current';
        } else if (type === 'past') {
            match[type] = 'past';
        } else if (type === 'dispute') {
            match[type] = 'dispute'
        }

        const bookings = await BookingModel.aggregate([
            {
                $match: match
            },
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

        return SUCCESS(res, 200, "Listings retrieved successfully", { bookings, pagination });
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
            match[type] = 'future';
        } else if (type === 'current') {
            match[type] = 'current';
        } else if (type === 'past') {
            match[type] = 'past';
        } else if (type === 'dispute') {
            match[type] = 'dispute'
        }

        const bookings = await BookingModel.aggregate([
            {
                $match: match
            },
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

        return SUCCESS(res, 200, "Listings retrieved successfully", { bookings, pagination });
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