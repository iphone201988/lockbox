import { ObjectId } from "mongoose";
import { Document } from "mongoose";
import { Socket } from "socket.io";


type LocationType = {
  type: "Point";
  coordinates: [number, number];
};

export interface UserModelType extends Document {
  _id: ObjectId;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  countryCode: string | null;
  password: string;
  dashboardRole: string | null;
  role: string;
  latitude: number | null;
  longitude: number | null;
  location: LocationType;
  profileImage: string | null;
  work: string;
  bio: string;
  address: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  isDeactivateAccount: boolean;
  isAccountBanByAdmin: boolean;
  verifyOtp: boolean;
  otp: string | null;
  otpExpires: Date | null;
  jti: string | null;
  deviceToken: string | null;
  deviceType: number | null;
  timeZone: string | null;
  lastActive: Date | null;
  gender: number;
  step: number;
  emailNotification: boolean;
  smsNotification: boolean;
  stripeCustomerId: string | null;
  stripeAccountId: string | null;
  isStripeAccountConnected: boolean;
  tempVariable:{
    email: string | null;
    phone: string | null;
    countryCode: string | null;
  }
  matchPassword(enteredPassword: string): Promise<boolean>;
};
export interface IListing extends Document {
  _id: ObjectId;
  userId: ObjectId;
  address: string | null;
  city: string | null;
  spaceType: string | null;
  features?: Array<string>;
  allowedStorage?: Array<string>;
  length: number;
  width: number;
  price: number | null;
  storageImages?: Array<string>;
  tagline?: string | null;
  description?: string | null;
  policies?: string | null;
  accessPolicy?: string | null;
  frequency?: string | null;
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  latitude: number ;
  longitude: number ;
  location: LocationType;
  averageRating?: number ;
  totalReviews?: number ;
  status:string
}

export interface SocketWithUser extends Socket {
  userId?: string;
  user?: any;
  role?: string;
}