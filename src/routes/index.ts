import express from "express";
import userRouter from "./user.router";
import listingRouter from "./listing.router";
import bookingRouter from "./booking.router";
import adminRouter from "./admin.router";
const router = express.Router();


router.use('/admin',adminRouter);
router.use('/user',userRouter);
router.use('/listing',listingRouter);
router.use('/booking',bookingRouter);

export default router;
