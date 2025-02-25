import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/uploadImage";
import { accountRefresh, accountSuccess, addDashboardRole, addPassword, addPaymentMethodToCustomer, changeEmailAndPhoneNumber, createStripeAccount, getAllPaymentMethods, getProfile, login, register, removePaymentMethods, sendOtp, updateProfile, updateProfileImage, verifyOtp } from "../controllers/user.controller";
import { validate } from "../middleware/validate.middleware";
import { change_email_and_phone_numberSchema, log_inSchema, registerSchema, send_otpSchema, set_Dashboad_roleSchema, set_passwordSchema, update_profileSchema, verifyOtpSchema, write_reviewSchema } from "../validations/user.schema";
import { getHostAllReview, getMyReview, writeReviewAndrating } from "../controllers/review.controller";
import { getConversationMessagesBetweenTwoUsers, getUserConversations } from "../controllers/message.controller";
const userRouter = express.Router();

userRouter.post('/sign_up', validate(registerSchema), register);
userRouter.post('/verify', validate(verifyOtpSchema), verifyOtp);
userRouter.post('/set_password', validate(set_passwordSchema), addPassword);
userRouter.post('/add_dashboard_role', validate(set_Dashboad_roleSchema), addDashboardRole);
userRouter.post('/log_in', validate(log_inSchema), login);
userRouter.post('/send_otp', validate(send_otpSchema), sendOtp);
userRouter.get('/me', authMiddleware, getProfile);
userRouter.patch('/me', authMiddleware, validate(update_profileSchema), updateProfile);
userRouter.patch('/me/profile_update', authMiddleware, upload.single("profileImage"), updateProfileImage);
userRouter.post('/change_email_phone', authMiddleware, validate(change_email_and_phone_numberSchema), changeEmailAndPhoneNumber);


userRouter.post('/payment_method', authMiddleware, addPaymentMethodToCustomer);
userRouter.get('/payment_method', authMiddleware, getAllPaymentMethods);
userRouter.delete('/payment_method/:paymentMethodId', authMiddleware, removePaymentMethods);
userRouter.post('/create_stripe_account', authMiddleware, createStripeAccount);
userRouter.get("/account/refresh", accountRefresh);
userRouter.get("/account/success/:stripeAccountId", accountSuccess);


//write a reviews
userRouter.post('/review', authMiddleware, validate(write_reviewSchema), writeReviewAndrating);
userRouter.get('/review/me', authMiddleware, getMyReview);
userRouter.get('/review/host', authMiddleware, getHostAllReview);


//message
userRouter.get('/conversation', authMiddleware, getUserConversations);
userRouter.get('/conversation/:conversationId', authMiddleware, getConversationMessagesBetweenTwoUsers);










export default userRouter;