import express from "express";
import { adminAuthMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/uploadImage";
import { validate } from "../middleware/validate.middleware";
import {  getUserDetails, loginAdmin, searchUser } from "../controllers/admin.controller";
import { admin_log_inSchema, user_searchSchema } from "../validations/admin.schema";
const adminRouter = express.Router();

adminRouter.post('/log_in', validate(admin_log_inSchema), loginAdmin);
adminRouter.get('/user/:search', adminAuthMiddleware, validate(user_searchSchema), searchUser);
adminRouter.get('/user/:userId/details', adminAuthMiddleware, validate(user_searchSchema), getUserDetails);


export default adminRouter;