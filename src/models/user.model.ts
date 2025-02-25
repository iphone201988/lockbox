import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import {
  devicesTypeEnums,
  rolesEnums,
  genderEnums,
  dashboardRoles,
} from "../utils/enums";
import { UserModelType } from "../types/Database/types";


const UserSchema = new Schema<UserModelType>(
  {
    userId: { type: String,   default: "" },
    firstName: { type: String,   default: null },
    lastName: { type: String,   default: null },
    email: { type: String,default: null },
    phone: { type: String,   default: null },
    countryCode: { type: String,   default: null },
    password: { type: String, },
    role: {
      type: String,
      enum: Object.values(rolesEnums),
      default: rolesEnums.USER,
    },
    dashboardRole:{
      type: String,
      enum: Object.values(dashboardRoles),
      default: null
    },

    bio: { type: String,  default: "" },
    address: { type: String,  default: null },
    latitude:{
      type: Number,
      default: null,
    },
    longitude:{
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
    work: { type: String,  default: "" },// what he working
    profileImage: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isAccountBanByAdmin: { type: Boolean, default: false },
    isDeactivateAccount: { type: Boolean, default: false },
    otp: { type: String, default: null },
    verifyOtp: { type: Boolean, default: true },
    otpExpires: { type: Date, default: null },
    jti: { type: String, default: null },
    deviceToken: { type: String,  default: null },
    deviceType: {
      type: Number,
      enum: Object.values(devicesTypeEnums),
      default: null,
    },
    gender: { type: Number, enum: Object.values(genderEnums), default: null },
    step: { type: Number, default: 1 },
    emailNotification: { type: Boolean, default: false },
    smsNotification: { type: Boolean, default: false },
    stripeCustomerId: { type: String, default: null },
    stripeAccountId: { type: String, default: null },
    isStripeAccountConnected: { type: Boolean, default: false },
    tempVariable:{
      email:{
        type: String,
        default: null
      },
      phone:{
        type: String,
        default: null
      },
      countryCode:{
        type: String,
        default: null
      }
    }
  },
  { timestamps: true }

);
UserSchema.index({location: '2dsphere'});
UserSchema.index({userId: 'text'});
UserSchema.index({email: 'text'});
UserSchema.index({phone: 'text'});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean>{
  return bcrypt.compare(enteredPassword, this.password);
};
const UserModel = mongoose.model<UserModelType>("users", UserSchema,'users');

export default UserModel;
