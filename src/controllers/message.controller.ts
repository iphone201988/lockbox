import { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { SUCCESS } from "../utils/response";
import mongoose from "mongoose";
import ConversationModel from "../models/conversation.model";
import { createMessage } from "../utils/utils";
import MessageModel from "../models/message.model";


// get all conversation messages
export const getUserConversations = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.userId; 
        console.log(userId)
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const skip = (pageNumber - 1) * pageSize;

        const conversations = await ConversationModel.aggregate([
            {
                $match: {
                    participants: userId // Only fetch conversations where the user is a participant
                }
            },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: "users",
                    localField: "participants",
                    foreignField: "_id",
                    as: "participantsDetails"
                }
            },
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    bookingId: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    participants: {
                        $map: {
                            input: "$participantsDetails",
                            as: "participant",
                            in: {
                                _id: "$$participant._id",
                                firstName: "$$participant.firstName",
                                lastName: "$$participant.lastName",
                                email: "$$participant.email",
                                phone: "$$participant.phone",
                                countryCode: "$$participant.countryCode",
                                profileImage: "$$participant.profileImage"
                            }
                        }
                    },
                }
            },
            {
                $sort: { updatedAt: -1 } // Sort by most recent messages
            }
        ]);

        const totalCount = await ConversationModel.countDocuments({participants: userId});
        const pagination: any = {
            total: totalCount,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        };


        return SUCCESS(res, 200, "User conversations retrieved successfully", { conversations,pagination });
    } catch (error) {
        next(error);
    }
};


// get conversation messages between two users
export const getConversationMessagesBetweenTwoUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { conversationId } = req.params;
        const {page=1,limit=10} = req.query;
        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const skip = (pageNumber - 1) * pageSize;
        const pipeline: any[] = [
            { $match: { conversation: new mongoose.Types.ObjectId(conversationId) } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderDetails"
                }
            },
            { $unwind: "$senderDetails" },
            {
                $lookup: {
                    from: "booking",
                    localField: "bookingId",
                    foreignField: "_id",
                    as: "bookingId"
                }
            },
            { $unwind: { path: "$bookingId", preserveNullAndEmptyArrays: true } },
            
            {
                $project: {
                    _id: 1,
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    "senderDetails._id": 1,
                    "senderDetails.firstName": 1,
                    "senderDetails.lastName": 1,
                    "senderDetails.email": 1,
                    "senderDetails.phone": 1,
                    "senderDetails.profileImage": 1,
                    "senderDetails.countryCode": 1,
                    "senderDetails.dashboardRole": 1,
                    "bookingId": 1

                }
            }
        ];
        const totalCount = await MessageModel.countDocuments({ conversation: new mongoose.Types.ObjectId(conversationId) });
        const pagination: any = {
            total: totalCount,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        };
        const conversation = await ConversationModel.findById(conversationId).populate({
            path: 'bookingId',
            populate: {
              path: 'listingId', 
            }
          });
        const conversationMessages = await MessageModel.aggregate(pipeline);
   
        return SUCCESS(res, 200, "Conversation messages retrieved successfully", {conversation, conversationMessages,pagination });

    } catch (error) {
        next(error);
    }
}