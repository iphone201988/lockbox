import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { generateToken, rendomStringGenerate } from "../utils/utils";
import { UserModelType, } from "../types/Database/types";
import { SUCCESS } from "../utils/response";
import { sendEmail } from "../servers/sendEmail";
import { sendSms } from "../servers/twilioService";
import ListingModel from "../models/listing.model";
import mongoose from "mongoose";
import BookingModel from "../models/booking.model";
import DisputeModel from "../models/dispute.model";
import CheckInModel from "../models/cleckIn.model";

//login admin
export const loginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        let { email, password, deviceType, deviceToken, timeZone } = req.body;
        const admin = await UserModel.findOne({ email: { $regex: new RegExp(email, 'i') }, role: 'admin' });
        if (!admin) {
            throw new BadRequestError("Invalid email or password")
        }
        const macth = admin.matchPassword(password);
        if (!macth) {
            throw new BadRequestError("Invalid email or password")
        }
        admin.jti = rendomStringGenerate(20);
        admin.deviceType = deviceType;
        admin.deviceToken = deviceToken;
        admin.timeZone = timeZone;
        await admin.save();

        const accessToken = await generateToken({ id: admin._id, jti: admin.jti });
        return SUCCESS(res, 200, "Login success", { admin: { _id: admin._id, email: admin.email, profileImage: admin.profileImage, accessToken } })

    } catch (error: any) {
        next(error);
    }
}
// // search user 
export const searchUser = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const adminId = req.userId;
        const { search } = req.params;
        const filter = {
            $and: [{
                $or: [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { userId: { $regex: search, $options: "i" } },
                ]
            }, {
                _id: { $ne: adminId },
            }]
        }

        const users = await UserModel.aggregate([
            {
                $match: filter
            },
            {
                $project: {
                    userId: 1,
                    firstName: 1,
                    lastName: 1,
                    profileImage: 1,
                }
            }
        ]);
        return SUCCESS(res, 200, "Succes", { users });

    } catch (error) {
        console.error(error);
        next(error)
    }
}
export const getUserDetails = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const { userId } = req.params;
        const userDetails = await UserModel.findById(userId, { password: 0, otp: 0, otpExpires: 0, jti: 0 });
        if (!userDetails) {
            throw new NotFoundError("User not found");
        }
        return SUCCESS(res, 200, "Succes", { userDetails });

    } catch (error) {
        console.error(error);
        next(error)
    }
}

//ban or unBan user
export const banUnBanUser = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const { id, isAccountBanByAdmin } = req.query;
        const user = await UserModel.findByIdAndUpdate(id, { isAccountBanByAdmin });
        if (!user) {
            throw new NotFoundError("User not found")
        }
        return SUCCESS(res, 200, "Success", { user });

    } catch (error) {
        console.error(error);
        next(error)
    }
}

// listing of user 
export const listingOfUser = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const userId = req.query.userId as string;
        const listings = await ListingModel.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId), }
            },

        ]);
        return SUCCESS(res, 200, "Succes", { listings });

    } catch (error) {
        console.error(error);
        next(error)
    }
}
// Booking and payment of user 
export const bookingOfUser = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const userId = req.query.userId as string;
        const bookings = await BookingModel.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId), }
            },
            {
                $lookup: {
                    from: "listing",
                    localField: "listingId",
                    foreignField: "_id",
                    as: "listingId"
                }
            },
            {
                $unwind: {
                    path: "$listingId",
                    preserveNullAndEmptyArrays: true
                }
            },
        ]);
        return SUCCESS(res, 200, "Succes", { bookings });

    } catch (error) {
        console.error(error);
        next(error)
    }
}
// Booking and payment of user 
export const disputeOfUser = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const userId = req.query.userId as string;
        const disputes = await DisputeModel.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId), }
            },
            {
                $lookup: {
                    from: "booking",
                    localField: "bookingId",
                    foreignField: "_id",
                    as: "bookingId"
                }
            },
            {
                $unwind: {
                    path: "$bookingId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "listing",
                    localField: "bookingId.listingId",
                    foreignField: "_id",
                    as: "listingId"
                }
            },
            {
                $unwind: {
                    path: "$listingId",
                    preserveNullAndEmptyArrays: true
                }
            },
        ]);
        return SUCCESS(res, 200, "Succes", { disputes });

    } catch (error) {
        console.error(error);
        next(error)
    }
}
export const cleckInOfUser = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const userId = req.query.userId as string;
        const cleckIns = await CheckInModel.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId), }
            },
            {
                $lookup: {
                    from: "booking",
                    localField: "bookingId",
                    foreignField: "_id",
                    as: "bookingId"
                }
            },
            {
                $unwind: {
                    path: "$bookingId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "listing",
                    localField: "bookingId.listingId",
                    foreignField: "_id",
                    as: "listingId"
                }
            },
            {
                $unwind: {
                    path: "$listingId",
                    preserveNullAndEmptyArrays: true
                }
            },
        ]);
        return SUCCESS(res, 200, "Succes", { cleckIns });

    } catch (error) {
        console.error(error);
        next(error)
    }
}