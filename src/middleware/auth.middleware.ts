import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/utils";
import { ERROR } from "../utils/response";
import { ObjectId } from "mongoose";
import UserModel from "../models/user.model";
import { UnauthorizedError } from "../utils/errors";
import { UserModelType } from "../types/Database/types";


// Authentication Middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.headers.authorization) {
      throw new UnauthorizedError("Unauthorized")
    }

    const token = req.headers.authorization.split(" ")[1];
    // Verify token
    const decoded =  verifyToken(token);
      if (!decoded) {
        throw new UnauthorizedError("Unauthorized")
    }

    // Find user
    const user: UserModelType =  await UserModel.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError("Unauthorized")
    }
    if (user?.jti !== decoded?.jti) {
      throw new UnauthorizedError("Unauthorized")
    }
    
    req.user = user;
    req.userId = user._id;

    next(); 
  } catch (error) {
    next(error)
  }
};
export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.headers.authorization) {
      throw new UnauthorizedError("Unauthorized")
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded =  verifyToken(token);
      if (!decoded) {
        throw new UnauthorizedError("Unauthorized")
    }
    // Find user
    const user =  await UserModel.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError("Unauthorized")
    }
    if(user.role !="admin" ){
      throw new UnauthorizedError("This user is not authorized")
    }
    if (user?.jti !== decoded?.jti) {
      throw new UnauthorizedError("Unauthorized")
    }
    
    req.user = user;
    req.userId = user._id;

    next(); 
  } catch (error) {
      next(error)
  }
};
