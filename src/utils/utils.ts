import jwt from 'jsonwebtoken';
import ConversationModel from '../models/conversation.model';
import MessageModel from '../models/message.model';
import { ObjectId } from 'mongoose';
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export function rendomStringGenerate(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(){}[]:;<>+=?/|';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
export function generateToken(payload: any): any {
    const secretKey = process.env.JWT_SECRET_KEY;
    const expiresIn = "1d";
    const token = jwt.sign(payload, secretKey, { expiresIn });
    return token;
}
//verify token
export function verifyToken(token: string): any {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        return decoded;
    } catch (error) {
        console.error("Token verification error:", error);
        throw error;
    }
}
// craete message
interface ICreateMessage {
    user1: string | ObjectId, user2?: string | ObjectId, content: string, contentType?: 'text' | 'video' | 'audio' | 'image', bookingId?: string | ObjectId | any, conversationId?: string | ObjectId | any

}
export async function createMessage({ user1, user2, content, contentType = 'text', bookingId, conversationId }: ICreateMessage): Promise<any> {

    let conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
        conversation = await ConversationModel.findOne({ participants: { $all: [user1, user2] }, bookingId });
        if (!conversation) {
            if(!bookingId){
                throw new Error('Booking id is required');
            }
            conversation = new ConversationModel({ participants: [user1, user2], bookingId: bookingId});
        }
    }
    conversation.lastMessage = content;
    await conversation.save();
   const message =  await MessageModel.create({
        content,
        contentType,
        sender: user1,
        conversation: conversation._id,
        bookingId,
        bookingStatus: bookingId ? 'pending' : null
    });
   const populatedMessage = await MessageModel.findById(message._id)
    .populate({
        path: 'sender',
        select: '_id firstName lastName email phone profileImage countryCode dashboardRole'
    })
    .select('_id content createdAt updatedAt bookingId')
    .lean()
    .exec();
    const sender = populatedMessage.sender as any;
return {
    _id: populatedMessage._id,
    content: populatedMessage.content,
    createdAt: populatedMessage.createdAt,
    updatedAt: populatedMessage.updatedAt,
    senderDetails: {
        _id: sender?._id,
        firstName: sender?.firstName,
        lastName: sender?.lastName,
        email: sender?.email,
        phone: sender?.phone,
        profileImage: sender?.profileImage,
        countryCode: sender?.countryCode,
        dashboardRole: sender?.dashboardRole
    },
    bookingId: populatedMessage.bookingId
};
}
