import { Request } from "express";
import { UserModelType } from "./Database/types";
import { ObjectId } from "mongoose";
import { Socket } from "socket.io";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserModelType; // Properly typed user object
    userId?: string | ObjectId; // Supports both string and ObjectId
  }
}

declare module "socket.io" {
  interface Socket {
    userId?: string; // You can set the userId as optional if it's not always present
    role?: string; // You can set the role as optional if it's not always present
    user?: any;
  }
}

export {};
